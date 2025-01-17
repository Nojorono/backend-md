import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ActivityRepository } from '../repository/activity.repository';
import { logger } from 'nestjs-i18n';
import { ActivitySioRepository } from '../repository/activity_sio.repository';
import { S3Service } from 'src/modules/s3/service/s3.service';

@Injectable()
export class ActivitySioService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly activitySioRepository: ActivitySioRepository,
    private readonly s3Service: S3Service,
  ) {}

  async createDataSio(
    call_plan_schedule_id: number,
    createDto: any,
    files: {
      photo_before?: Express.Multer.File[];
      photo_after?: Express.Multer.File[];
    },
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

      if (files.photo_before) {
        createDto.photo_before = await this.s3Service.uploadCompressedImage(
          'activity_sio',
          files.photo_before[0]
        );
      }

      if (files.photo_after) {
        createDto.photo_after = await this.s3Service.uploadCompressedImage(
          'activity_sio',
          files.photo_after[0]
        );
      }

      const result = await this.activitySioRepository.create(createDto);
      return result;
    } catch (error) {
      logger.error('Error creating SIO activity:', error.message, error.stack);
      throw new BadRequestException(error.message);
    }
  }
}
