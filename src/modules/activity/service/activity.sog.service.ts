import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ActivityRepository } from '../repository/activity.repository';
import { logger } from 'nestjs-i18n';
import { ActivitySogRepository } from '../repository/activity_sog.repository';
import { ActivitySogDto } from '../dtos/activity_sog.dtos';

@Injectable()
export class ActivitySogService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly activitySogRepository: ActivitySogRepository,
  ) {}

  async createDataSog(
    call_plan_schedule_id: number,
    createDto: ActivitySogDto,
  ) {
    const callPlanSchedule =
      await this.activityRepository.findOneByCallPlanScheduleId(
        call_plan_schedule_id,
      );
    if (!callPlanSchedule) {
      throw new NotFoundException('Call Plan Schedule not found');
    }
    try {
      createDto.activity_id = callPlanSchedule.id;
      const result = await this.activitySogRepository.create(createDto);
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
