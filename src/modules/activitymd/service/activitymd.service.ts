import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserRepo } from '../../user/repository/user.repo';
import {
  CreateMdActivityDto,
  UpdateMdActivityDto,
} from '../dtos/activitymd.dtos';
import { ActivityMdRepository } from '../repository/activitymd.repository';
import { logger } from 'nestjs-i18n';
import { OutletRepository } from '../../outlet/repository/outlet.repository';
import { CallPlanScheduleRepository } from '../../callplan/repository/callplanschedule.repository';

@Injectable()
export class ActivityMdService {
  constructor(
    private readonly repository: ActivityMdRepository,
    private readonly userRepository: UserRepo,
    private readonly outletRepository: OutletRepository,
    private readonly scheduleRepository: CallPlanScheduleRepository,
  ) {}

  async createData(createDto: CreateMdActivityDto) {
    try {
      return this.repository.create(createDto);
    } catch (e) {
      logger.error('Error in create user:', e.message, e.stack);
      if (e instanceof HttpException) {
        throw e;
      }
      throw new InternalServerErrorException('Failed to create activity');
    }
  }

  async getDataById(id: number) {
    return this.repository.getById(id);
  }

  async updateData(id: number, updateDto: UpdateMdActivityDto) {
    return this.repository.update(id, updateDto);
  }

  async deleteData(id: number, accessToken: string): Promise<void> {
    const user = await this.userRepository.findByToken(accessToken);
    return this.repository.delete(id, user.email);
  }

  async getAllActive(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    return this.repository.getAllActive(page, limit, searchTerm);
  }
}
