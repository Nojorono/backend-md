import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  HttpStatus,
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
import { ActivityBranchRepository } from '../repository/activity_branch.repository';
import { CallPlanScheduleRepository } from 'src/modules/callplan/repository/callplanschedule.repository';
import { ActivitySioDto } from '../dtos/activity_sio.dtos';
import { ActivitySogDto } from '../dtos/activity_sog.dtos';
import { ActivityBranchDto } from '../dtos/activity_branch.dtos';
import { STATUS_APPROVED, STATUS_PERM_CLOSED } from 'src/constants';
import { OutletRepository } from 'src/modules/outlet/repository/outlet.repository';

@Injectable()
export class ActivityService {
  constructor(
    private readonly repository: ActivityRepository,
    private readonly activitySioRepository: ActivitySioRepository,
    private readonly activitySogRepository: ActivitySogRepository,
    private readonly activityBranchRepository: ActivityBranchRepository,
    private readonly userRepository: UserRepo,
    private readonly s3Service: S3Service,
    private readonly i18n: I18nService,
    private readonly callPlanScheduleRepository: CallPlanScheduleRepository,
    private readonly outletRepository: OutletRepository,
  ) {}

  async createDataSio(createDto: ActivitySioDto, file: Express.Multer.File) {
    try {
      if (!createDto.activity_id) {
        throw new BadRequestException(
          await this.i18n.translate('Activity ID is required'),
        );
      }

      if (file) {
        createDto.photo = await this.s3Service.uploadImageFlexible(
          file,
          'activity_sio',
        );
      }

      const result = await this.activitySioRepository.create(createDto);
      return result;
    } catch (error) {
      logger.error('Error creating SIO activity:', error.message, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  async createDataSog(createDto: ActivitySogDto) {
    try {
      if (!createDto.activity_id) {
        throw new BadRequestException(
          await this.i18n.translate('Activity ID is required'),
        );
      }

      const result = await this.activitySogRepository.create(createDto);
      return result;
    } catch (error) {
      logger.error('Error creating SOG activity:', error.message, error.stack);
      throw new BadRequestException(error.message);
    }
  }

  async createDataBranch(createDto: ActivityBranchDto) {
    try {
      if (!createDto.activity_id) {
        throw new BadRequestException(
          await this.i18n.translate('Activity ID is required'),
        );
      }

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

  async createDataActivity(createDto: CreateMdActivityDto) {
    try {
      // Validate required fields
      this.validateRequiredFields(createDto);

      // Validate user exists
      const user = await this.validateUser(createDto.user_id);

      // Validate and convert dates
      if (createDto.start_time) {
        createDto.start_time = new Date(createDto.start_time);  
      }
  
      if (createDto.end_time) {
        createDto.end_time = new Date(createDto.end_time);
      }
      // Set metadata
      createDto.created_by = user.email;
      createDto.created_at = new Date();

      // Process photos if present
      if (createDto.photos) {
        createDto.photos = await this.processPhotos(createDto.photos);
      }

      // Create main activity record
      const [activity] = await this.repository.create(createDto);
      if (!activity) {
        throw new InternalServerErrorException(
          await this.i18n.translate(
            'translation.Failed to create activity record',
          ),
        );
      }

      // Update call plan schedule status
      await this.updateCallPlanSchedule(createDto);

      return activity;
    } catch (error) {
      logger.error('Error in create activity:', error.message, error.stack);
      if (error instanceof HttpException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  private async validateRequiredFields(createDto: CreateMdActivityDto) {
    if (
      !createDto.user_id ||
      !createDto.call_plan_schedule_id ||
      !createDto.call_plan_id
    ) {
      throw new BadRequestException(
        await this.i18n.translate('translation.Bad Request Exception'),
      );
    }
  }

  private async validateUser(userId: number) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new BadRequestException(
        await this.i18n.translate('translation.User not found'),
      );
    }
    return user;
  }

  private async validateDates(createDto: CreateMdActivityDto) {

    if (createDto.start_time) {
      createDto.start_time = new Date(createDto.start_time);  
    }

    if (createDto.end_time) {
      createDto.end_time = new Date(createDto.end_time);
    }

    if (isNaN(createDto.start_time.getTime()) || isNaN(createDto.end_time.getTime())) {
      throw new BadRequestException(
        await this.i18n.translate('translation.Invalid date format'),
      );
    }

    if (createDto.start_time >= createDto.end_time) {
      throw new BadRequestException(
        await this.i18n.translate(
          'translation.Start time must be before end time',
        ),
      );
    }
  }

  private async processPhotos(photos: any[]): Promise<string[]> {
    if (!Array.isArray(photos)) {
      throw new BadRequestException(
        await this.i18n.translate('translation.Photos must be an array'),
      );
    }

    return Promise.all(
      photos.map(async (photo) => {
        if (!photo) {
          throw new BadRequestException(
            await this.i18n.translate('translation.Invalid photo data'),
          );
        }
        try {
          return await this.s3Service.uploadImageFlexible(photo, 'activity');
        } catch (error) {
          throw new BadRequestException(
            await this.i18n.translate('translation.Invalid photo format'),
          );
        }
      }),
    );
  }

  private async updateCallPlanSchedule(createDto: CreateMdActivityDto) {
    await this.callPlanScheduleRepository.updateStatus(
      createDto.call_plan_schedule_id,
      {
        status: 200,
        time_start: createDto.start_time,
        time_end: createDto.end_time,
      },
    );
  }

  async getDataById(id: number) {
    try {
      const activity = await this.repository.getById(id);
      if (!activity) {
        throw new NotFoundException(
          await this.i18n.translate('translation.Activity not found'),
        );
      }
      return activity;
    } catch (error) {
      throw new BadRequestException({
        statusCode: 400,
        message: await this.i18n.translate('translation.Bad Request Exception'),
        timestamp: new Date().toISOString(),
      });
    }
  }

  async getRegionAndArea(id: number) {
    try {
      const data = await this.repository.getRegionAndArea(id);
      if (!data) {
        throw new NotFoundException(
          await this.i18n.translate('translation.Activity not found'),
        );
      }
      return data;
    } catch (error) {
      throw new BadRequestException({
        statusCode: 400,
        message: await this.i18n.translate('translation.Bad Request Exception'),
        timestamp: new Date().toISOString(),
      });
    }
  }

  async updateData(id: number, updateDto: UpdateMdActivityDto) {
    try {
      const existingActivity = await this.repository.getById(id);
      if (!existingActivity) {
        throw new NotFoundException(
          await this.i18n.translate('translation.Activity not found'),
        );
      }

      return await this.repository.update(id, updateDto);
    } catch (error) {
      logger.error('Error in update activity:', error.message, error.stack);
      if (error instanceof HttpException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async deleteData(id: number, accessToken: string): Promise<void> {
    try {
      const user = await this.userRepository.findByToken(accessToken);
      if (!user) {
        throw new NotFoundException(
          await this.i18n.translate('translation.User not found'),
        );
      }

      const activity = await this.repository.getById(id);
      if (!activity) {
        throw new NotFoundException(
          await this.i18n.translate('translation.Activity not found'),
        );
      }

      await this.repository.delete(id, user.email);
    } catch (error) {
      throw new BadRequestException({
        statusCode: 400,
        message: await this.i18n.translate('translation.Bad Request Exception'),
        timestamp: new Date().toISOString(),
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
      return await this.repository.getAllActive(
        page,
        limit,
        searchTerm,
        filter,
      );
    } catch (error) {
      console.log(error);
      throw new BadRequestException({
        statusCode: 400,
        message: await this.i18n.translate('translation.Bad Request Exception'),
        timestamp: new Date().toISOString(),
      });
    }
  }

  async updateStatus(id: number, updateDto: UpdateStatusDto) {
    try {
      const activity = await this.repository.getById(id);
      if (!activity) {
        throw new HttpException(
          await this.i18n.translate('translation.Activity not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      if (
        activity.outlet_id &&
        activity.status === STATUS_PERM_CLOSED &&
        updateDto.status === STATUS_APPROVED
      ) {
        await this.outletRepository.updateOutletStatus(activity.outlet_id, {
          is_active: 0,
          remarks: 'Outlet Tutup Permanen',
          updated_by: activity.created_by,
          updated_at: new Date(),
        });
      }

      if (activity.survey_outlet_id && updateDto.status === STATUS_APPROVED) {
        await this.outletRepository.createOutlet({
          name: activity.surveyOutlet.name,
          unique_name: activity.surveyOutlet.unique_name,
          brand: activity.surveyOutlet.brand,
          address_line: activity.surveyOutlet.address_line,
          sub_district: activity.surveyOutlet.sub_district,
          district: activity.surveyOutlet.district,
          city_or_regency: activity.surveyOutlet.city_or_regency,
          postal_code: activity.surveyOutlet.postal_code,
          latitude: activity.latitude,
          longitude: activity.longitude,
          sio_type: activity.surveyOutlet.sio_type,
          region: activity.surveyOutlet.region,
          area: activity.surveyOutlet.area,
          cycle: activity.surveyOutlet.cycle,
          visit_day: activity.surveyOutlet.visit_day,
          odd_even: activity.surveyOutlet.odd_even,
          remarks: activity.surveyOutlet.remarks,
          photos: activity.photos,
          created_by: activity.created_by,
          created_at: new Date(),
        });
      }

      const result = await this.repository.updateStatus(id, updateDto);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
