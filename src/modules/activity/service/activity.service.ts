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
import { SurveyRepository } from 'src/modules/survey/repository/survey.repository';
import { JwtService } from '@nestjs/jwt';
import { ActivityProgramRepository } from '../repository/activity_program.repository';
@Injectable()
export class ActivityService {
  constructor(
    private readonly repository: ActivityRepository,
    private readonly activitySioRepository: ActivitySioRepository,
    private readonly activitySogRepository: ActivitySogRepository,
    private readonly activityBranchRepository: ActivityBranchRepository,
    private readonly activityProgramRepository: ActivityProgramRepository,
    private readonly jwtService: JwtService,
    private readonly s3Service: S3Service,
    private readonly i18n: I18nService,
    private readonly callPlanScheduleRepository: CallPlanScheduleRepository,
    private readonly outletRepository: OutletRepository,
    private readonly surveyOutletRepository: SurveyRepository,
    private readonly userRepository: UserRepo,
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

  async createDataProgram(createDto: any, file: Express.Multer.File) {
    try {
      if (!createDto.activity_id) {
        throw new BadRequestException(
          await this.i18n.translate('Activity ID is required'),
        );
      }

      if (file) {
        createDto.photo = await this.s3Service.uploadImageFlexible(
          file,
          'activity_program',
        );
      }

      const result = await this.activityProgramRepository.create(createDto);
      return result;
    } catch (error) {
      logger.error('Error creating Program activity:', error.message, error.stack);
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

  async createDataActivity(createDto: any) {
    try {
      // Convert relevant fields to integers
      createDto.user_id = parseInt(createDto.user_id, 10);
      createDto.call_plan_id = parseInt(createDto.call_plan_id, 10);
      createDto.call_plan_schedule_id = parseInt(createDto.call_plan_schedule_id, 10);
      createDto.outlet_id = createDto.outlet_id ? parseInt(createDto.outlet_id, 10) : null;
      createDto.survey_outlet_id = createDto.survey_outlet_id ? parseInt(createDto.survey_outlet_id, 10) : null;
      createDto.program_id = createDto.program_id ? parseInt(createDto.program_id, 10) : null;
      createDto.status = parseInt(createDto.status, 10);
      createDto.status_approval = parseInt(createDto.status_approval, 10);

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
        if(Array.isArray(createDto.photos)) {
          createDto.photos = await this.processPhotos(createDto.photos);
        }
      }

      if (createDto.photo_program) {
        createDto.photo_program = await this.s3Service.uploadCompressedImage('activity-program', createDto.photo_program);
      }

      if (createDto.range_facility) {        
        // Parse range facility values with default 0
        const rangeFacility = {
          range_health_facilities: parseInt(createDto.range_facility.range_health_facilities, 10) || 0,
          range_work_place: parseInt(createDto.range_facility.range_work_place, 10) || 0, 
          range_public_transportation_facilities: parseInt(createDto.range_facility.range_public_transportation_facilities, 10) || 0,
          range_worship_facilities: parseInt(createDto.range_facility.range_worship_facilities, 10) || 0,
          range_playground_facilities: parseInt(createDto.range_facility.range_playground_facilities, 10) || 0,
          range_educational_facilities: parseInt(createDto.range_facility.range_educational_facilities, 10) || 0
        };

        if(createDto.outlet_id) {
          await this.outletRepository.updateOutlet(createDto.outlet_id, rangeFacility);
        } else if(createDto.survey_outlet_id) {
          await this.surveyOutletRepository.updateData(createDto.survey_outlet_id, rangeFacility);
        }
      }

       // Create main activity record
       const [result] = await this.repository.create(createDto);

      // Update call plan schedule status
      await this.updateCallPlanSchedule(result);

      return result;
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

  private async processPhotos(photos: any[]): Promise<string[]> {
    if (!Array.isArray(photos)) {
      throw new BadRequestException(
        await this.i18n.translate('translation.Photos must be an array'),
      );
    }

    const photoString: string[] = [];

    await Promise.all(
      photos.map(async (photo) => {
        if (!photo) {
          throw new BadRequestException(
            await this.i18n.translate('translation.Invalid photo data'),
          );
        }
        try {
          const photoUrl = await this.s3Service.uploadCompressedImage('activity', photo);
          photoString.push(photoUrl);
        } catch (error) {
          throw new BadRequestException(
            await this.i18n.translate('translation.Invalid photo format'),
          );
        }
      }),
    );

    return photoString;
  }

  private async updateCallPlanSchedule(result: any) {
    console.log('createDto Update Call Plan Schedule', result);
    await this.callPlanScheduleRepository.updateStatus(
      result.call_plan_schedule_id,
      {
        status: 200,
        time_start: result.start_time,
        time_end: result.end_time,
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
      const decoded = this.jwtService.verify(accessToken);
      if (!decoded) {
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

      await this.repository.delete(id, decoded.email);
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
