import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ActivityRepository } from '../repository/activity.repository';
import { logger } from 'nestjs-i18n';
import { ActivityProgramRepository } from '../repository/activity_program.repository';
import { S3Service } from 'src/modules/s3/service/s3.service';

@Injectable()
export class ActivityProgramService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly activityProgramRepository: ActivityProgramRepository,
    private readonly s3Service: S3Service,
  ) {}

  async createDataProgram(call_plan_schedule_id: number, createDto: any, file: Express.Multer.File) {
    const callPlanSchedule =
      await this.activityRepository.findOneByCallPlanScheduleId(
        call_plan_schedule_id,
      );
    if (!callPlanSchedule) {
      throw new NotFoundException('Call Plan Schedule not found');
    }
    try {

      createDto.activity_id = callPlanSchedule.id;

      if (file) {
        createDto.photo = await this.s3Service.uploadImageFlexible(
          file,
          'activity_program',
        );
      }

      const result = await this.activityProgramRepository.create(createDto);
      return result;
    } catch (error) {
      logger.error(
        'Error creating Program activity:',
        error.message,
        error.stack,
      );
      throw new BadRequestException(error.message);
    }
  }
}
