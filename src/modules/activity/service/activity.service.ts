import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserRepo } from '../../user/repository/user.repo';
import {
  CreateMdActivityDto,
  UpdateMdActivityDto,
  UpdateStatusDto,
} from '../dtos/activitymd.dtos';
import { ActivityRepository } from '../repository/activity.repository';
import { logger } from 'nestjs-i18n';
import { ActivitySioRepository } from '../repository/activity_sio.repository';
import { ActivitySogRepository } from '../repository/activity_sog.repository';
import { S3Service } from 'src/modules/s3/service/s3.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class ActivityService {
  constructor(
    private readonly repository: ActivityRepository,
    private readonly activitySioRepository: ActivitySioRepository,
    private readonly activitySogRepository: ActivitySogRepository,
    private readonly userRepository: UserRepo,
    private readonly s3Service: S3Service,
    private readonly i18n: I18nService,
  ) {}

  async createData(createDto: CreateMdActivityDto) {
    try {
      // Validate required fields
      if (!createDto.user_id || !createDto.call_plan_schedule_id) {
        throw new BadRequestException(await this.i18n.translate('translation.Bad Request Exception'));
      }

      // Validate user exists
      const user = await this.userRepository.findById(createDto.user_id);
      if (!user) {
        throw new BadRequestException(await this.i18n.translate('translation.User not found'));
      }

      // Set metadata
      createDto.created_by = user.email;
      createDto.created_at = new Date();
      
      // Validate and convert dates
      if (!createDto.start_time || !createDto.end_time) {
        throw new BadRequestException(await this.i18n.translate('translation.Start time and end time are required'));
      }
      createDto.start_time = new Date(createDto.start_time);
      createDto.end_time = new Date(createDto.end_time);

      if (createDto.start_time >= createDto.end_time) {
        throw new BadRequestException(await this.i18n.translate('translation.Start time must be before end time'));
      }

      // Validate photos format if present
      if (createDto.photos) {
        if (!Array.isArray(createDto.photos)) {
          throw new BadRequestException(await this.i18n.translate('translation.Photos must be an array'));
        }
        createDto.photos = await Promise.all(
          createDto.photos.map(async (photo) => {
            try {
              return await this.s3Service.uploadImageFromUri(photo, 'activity');
            } catch (error) {
              throw new BadRequestException(await this.i18n.translate('translation.Invalid photo format'));
            }
          })
        );
      }

      // Create main activity record
      const [activity] = await this.repository.create(createDto);
      if (!activity) {
        throw new InternalServerErrorException(await this.i18n.translate('translation.Failed to create activity record'));
      }

      // Handle SIO entries
      if (createDto.activity_sio?.length) {
        const sioEntries = await Promise.all(
          createDto.activity_sio.map(async sio => {
            try {
              return {
                ...sio,
                activity_id: activity.id,
                photo: sio.photo ? 
                  await this.s3Service.uploadImageFromUri(sio.photo, 'activity_sio') : 
                  null,
              };
            } catch (error) {
              throw new BadRequestException(await this.i18n.translate('translation.Invalid SIO photo format'));
            }
          })
        );
        await this.activitySioRepository.create(sioEntries);
      }

      // Handle SOG entries  
      if (createDto.activity_sog?.length) {
        const sogEntries = createDto.activity_sog.map(sog => ({
          ...sog,
          activity_id: activity.id,
        }));
        await this.activitySogRepository.create(sogEntries);
      }

      return activity;

    } catch (error) {
      logger.error('Error in create activity:', error.message, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException({
        statusCode: 400,
        message: await this.i18n.translate('translation.Bad Request Exception'),
        timestamp: new Date().toISOString()
      });
    }
  }

  async getDataById(id: number) {
    try {
      const activity = await this.repository.getById(id);
      if (!activity) {
        throw new NotFoundException(await this.i18n.translate('translation.Activity not found'));
      }
      return activity;
    } catch (error) {
      throw new BadRequestException({
        statusCode: 400,
        message: await this.i18n.translate('translation.Bad Request Exception'),
        timestamp: new Date().toISOString()
      });
    }
  }

  async getRegionAndArea(id: number) {
    try {
      const data = await this.repository.getRegionAndArea(id);
      if (!data) {
        throw new NotFoundException(await this.i18n.translate('translation.Activity not found'));
      }
      return data;
    } catch (error) {
      throw new BadRequestException({
        statusCode: 400,
        message: await this.i18n.translate('translation.Bad Request Exception'),
        timestamp: new Date().toISOString()
      });
    }
  }

  async updateData(id: number, updateDto: UpdateMdActivityDto) {
    try {
      const existingActivity = await this.repository.getById(id);
      if (!existingActivity) {
        throw new NotFoundException(await this.i18n.translate('translation.Activity not found'));
      }

      if (updateDto.start_time) updateDto.start_time = new Date(updateDto.start_time);
      if (updateDto.end_time) updateDto.end_time = new Date(updateDto.end_time);

      if (updateDto.start_time && updateDto.end_time && 
          updateDto.start_time >= updateDto.end_time) {
        throw new BadRequestException(await this.i18n.translate('translation.Start time must be before end time'));
      }

      if (updateDto.photos?.length) {
        updateDto.photos = await Promise.all(
          updateDto.photos.map(async (photo) => {
            try {
              return await this.s3Service.uploadImageFromUri(photo, 'activity');
            } catch (error) {
              throw new BadRequestException(await this.i18n.translate('translation.Invalid photo format'));
            }
          })
        );
      }

      return await this.repository.update(id, updateDto);
    } catch (error) {
      throw new BadRequestException({
        statusCode: 400,
        message: await this.i18n.translate('translation.Bad Request Exception'),
        timestamp: new Date().toISOString()
      });
    }
  }

  async deleteData(id: number, accessToken: string): Promise<void> {
    try {
      const user = await this.userRepository.findByToken(accessToken);
      if (!user) {
        throw new NotFoundException(await this.i18n.translate('translation.User not found'));
      }

      const activity = await this.repository.getById(id);
      if (!activity) {
        throw new NotFoundException(await this.i18n.translate('translation.Activity not found'));
      }

      await this.repository.delete(id, user.email);
    } catch (error) {
      throw new BadRequestException({
        statusCode: 400,
        message: await this.i18n.translate('translation.Bad Request Exception'),
        timestamp: new Date().toISOString()
      });
    }
  }

  async getAllActive(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
    filter: any = {},
  ) {
    try {
      return await this.repository.getAllActive(page, limit, searchTerm, filter);
    } catch (error) {
      console.log(error);
      throw new BadRequestException({
        statusCode: 400,
        message: await this.i18n.translate('translation.Bad Request Exception'),
        timestamp: new Date().toISOString()
      });
    }
  }

  async updateStatus(id: number, updateDto: UpdateStatusDto) {
    return await this.repository.updateStatus(id, updateDto);
  }
}
