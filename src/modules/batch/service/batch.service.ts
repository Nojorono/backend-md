import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException
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

  async createData(createBatchDto: CreateBatchDto) {
    try {
      // Create new batch
      const newBatch = await this.batchRepository.create(createBatchDto);
      // Get outlet summary for targets
      const outletSummary = await this.outletRepository.getOutletSummary();
      if (!outletSummary || outletSummary.length === 0) {
        logger.warn('No outlet summary data found for batch targets');
      }

      // Create batch targets
      if (outletSummary) {
        const batchTargetPromises = outletSummary.map(target => 
          this.batchTargetRepository.createDummy({
            batch_id: newBatch[0].id,
            regional: target.regional,
            amo: target.area,
            brand: target.brand,
            sio_type: target.sio_type,
            brand_type_sio: target.brand_type_sio,
            amo_brand_type: target.brand_type_outlet,
          })
        );
        await Promise.all(batchTargetPromises);
      }

      return newBatch;
    } catch (error) {
      logger.error('Error in create batch:', error.message, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }else{
        throw new InternalServerErrorException('Failed to create batch data');
      }
    }
  }

  async getDataById(id: number) {
    const batch = await this.batchRepository.getById(id);
    if (!batch) {
      throw new NotFoundException(`Batch with id ${id} not found`);
    }
    return batch;
  }

  async updateData(id: string, updateBatchDto: UpdateBatchDto) {
    try {
      const updated = await this.batchRepository.update(id, updateBatchDto);
      if (!updated) {
        throw new NotFoundException(`Batch with id ${id} not found`);
      }
      return updated;
    } catch (error) {
      logger.error('Error updating batch:', error.message, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update batch data');
    }
  }

  async deleteData(id: string, accessToken: string): Promise<void> {
    try {
      const user = await this.userRepository.findByToken(accessToken);
      if (!user) {
        throw new BadRequestException('Invalid access token');
      }
      await this.batchRepository.delete(id, user.email);
    } catch (error) {
      logger.error('Error deleting batch:', error.message, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete batch data');
    }
  }

  async getAllRolesList() {
    try {
      return await this.batchRepository.getList();
    } catch (error) {
      logger.error('Error getting roles list:', error.message, error.stack);
      throw new InternalServerErrorException('Failed to get roles list');
    }
  }

  async getAllActiveData(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    try {
      return await this.batchRepository.getAllActive(page, limit, searchTerm);
    } catch (error) {
      logger.error('Error getting active data:', error.message, error.stack);
      throw new InternalServerErrorException('Failed to get active batch data');
    }
  }
}
