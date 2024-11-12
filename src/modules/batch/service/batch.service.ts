import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { BatchRepository } from '../repository/batch.repository';
import { UserRepo } from '../../user/repository/user.repo';
import { CreateBatchDto, UpdateBatchDto } from '../dtos/batch.dtos';
import { logger } from 'nestjs-i18n';
import { OutletRepository } from '../../outlet/repository/outlet.repository';
import { BatchTargetRepository } from '../repository/batchtarget.repository';

@Injectable()
export class BatchService {
  constructor(
    private readonly batchRepository: BatchRepository,
    private readonly batchTargetRepository: BatchTargetRepository,
    private readonly userRepository: UserRepo,
    private readonly outletRepository: OutletRepository,
  ) {}

  async createData(createRolesDto: CreateBatchDto) {
    try {
      const newData = await this.batchRepository.create(createRolesDto);
      const dummyTarget = await this.outletRepository.getOutletSummary();
      if (dummyTarget && newData) {
        for (const target of dummyTarget) {
          await this.batchTargetRepository.create({
            batch_id: newData[0].id,
            regional: target.regional,
            amo: target.area,
            brand_type_sio: target.brand_type_sio,
            amo_brand_type: target.brand_type_outlet,
          });
        }
      }
      return newData;
    } catch (e) {
      logger.error('Error in create data:', e.message, e.stack);
      if (e instanceof HttpException) {
        throw e;
      }
      throw new InternalServerErrorException('Failed to create data');
    }
  }

  async getDataById(id: number) {
    return this.batchRepository.getById(id);
  }

  async updateData(id: string, updateRolesDto: UpdateBatchDto) {
    return this.batchRepository.update(id, updateRolesDto);
  }

  async deleteData(id: string, accessToken: string): Promise<void> {
    const user = await this.userRepository.findByToken(accessToken);
    return this.batchRepository.delete(id, user.email);
  }
  async getAllRolesList() {
    return this.batchRepository.getList();
  }
  async getAllActiveData(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    return this.batchRepository.getAllActive(page, limit, searchTerm);
  }
}
