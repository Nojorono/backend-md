import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ActivityRepository } from '../repository/activity.repository';
import { logger } from 'nestjs-i18n';
import { ActivitySioRepository } from '../repository/activity_sio.repository';
import { S3Service } from 'src/modules/s3/service/s3.service';
import { UserRepo } from 'src/modules/user/repository/user.repo';
import { NotificationsService } from 'src/modules/notifications/service/notifications.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ActivitySioService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly activitySioRepository: ActivitySioRepository,
    private readonly userRepository: UserRepo,
    private readonly NotificationsService: NotificationsService,
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
          files.photo_before[0],
        );
      }

      if (files.photo_after) {
        createDto.photo_after = await this.s3Service.uploadCompressedImage(
          'activity_sio',
          files.photo_after[0],
        );
      }

      const result = await this.activitySioRepository.create(createDto);
      return result;
    } catch (error) {
      logger.error('Error creating SIO activity:', error.message, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  async validateDataSio(data: any) {
    let createNotification = 0;
    if (data.notes) {
      createNotification = 1;
    }
    if (createNotification == 1) {
      const findActivity = await this.activityRepository.getById(data.activity_id);
      const user = await this.userRepository.findById(findActivity.user_id);
      const notification_identifier = uuidv4();
      this.NotificationsService.create(
        {
          type: 2,
          notification_identifier: notification_identifier,
          message: 'SIO butuh pemeriksaan',
          activity_id: data.activity_id,
        },
        user,
        findActivity.region,
        findActivity.area,
      );

      await this.activityRepository.update(data.activity_id, {
        status_approval: 0,
      });
    }
  }
}
