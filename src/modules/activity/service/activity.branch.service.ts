import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ActivityRepository } from '../repository/activity.repository';
import { logger } from 'nestjs-i18n';
import { ActivityBranchRepository } from '../repository/activity_branch.repository';
import { ActivityBranchDto } from '../dtos/activity_branch.dtos';

@Injectable()
export class ActivityBranchService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly activityBranchRepository: ActivityBranchRepository,
  ) {}

  async createDataBranch(
    call_plan_schedule_id: number,
    createDto: ActivityBranchDto,
  ) {
    try {
      const callPlanSchedule =
        await this.activityRepository.findOneByCallPlanScheduleId(
          call_plan_schedule_id,
        );
      if (!callPlanSchedule) {
        throw new NotFoundException('Call Plan Schedule not found');
      }
      createDto.activity_id = callPlanSchedule.id;
      const result = await this.activityBranchRepository.create(createDto);
      return result;
    } catch (error) {
      logger.error(
        'Error creating branch activity:',
        error.message,
        error.stack,
      );
      throw new BadRequestException(error.message);
    }
  }
}
