import {
  HttpException,
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { UserRepo } from '../../user/repository/user.repo';
import {
  CreateMdActivityDto,
  UpdateMdActivityDto,
  UpdateStatusApprovalDto,
} from '../dtos/activitymd.dtos';
import { ActivityRepository } from '../repository/activity.repository';
import { logger } from 'nestjs-i18n';
import { S3Service } from 'src/modules/s3/service/s3.service';
import { I18nService } from 'nestjs-i18n';
import { CallPlanScheduleRepository } from 'src/modules/callplan/repository/callplanschedule.repository';
import { STATUS_APPROVED, STATUS_PERM_CLOSED } from 'src/constants';
import { OutletRepository } from 'src/modules/outlet/repository/outlet.repository';
import { SurveyRepository } from 'src/modules/survey/repository/survey.repository';
import { JwtService } from '@nestjs/jwt';
import { DrizzleService } from 'src/common/services/drizzle.service';
import { BatchTargetRepository } from 'src/modules/batch/repository/batchtarget.repository';
@Injectable()
export class ActivityService {
  constructor(
    private readonly repository: ActivityRepository,
    private readonly batchTargetRepository: BatchTargetRepository,
    private readonly jwtService: JwtService,
    private readonly s3Service: S3Service,
    private readonly i18n: I18nService,
    private readonly callPlanScheduleRepository: CallPlanScheduleRepository,
    private readonly outletRepository: OutletRepository,
    private readonly surveyOutletRepository: SurveyRepository,
    private readonly userRepository: UserRepo,
    private readonly drizzleService: DrizzleService,
  ) {}

  async createDataActivity(createDto: any) {
    try {
      // Convert relevant fields to integers
      createDto.user_id = createDto.user_id
        ? parseInt(createDto.user_id, 10)
        : null;
      createDto.call_plan_id = createDto.call_plan_id
        ? parseInt(createDto.call_plan_id, 10)
        : null;
      createDto.call_plan_schedule_id = createDto.call_plan_schedule_id
        ? parseInt(createDto.call_plan_schedule_id, 10)
        : null;
      createDto.outlet_id = createDto.outlet_id
        ? parseInt(createDto.outlet_id, 10)
        : null;
      createDto.survey_outlet_id = createDto.survey_outlet_id
        ? parseInt(createDto.survey_outlet_id, 10)
        : null;
      createDto.program_id = createDto.program_id
        ? parseInt(createDto.program_id, 10)
        : null;
      createDto.status = parseInt(createDto.status, 10);
      createDto.status_approval = createDto.status_approval
        ? parseInt(createDto.status_approval, 10)
        : null;
      createDto.sale_outlet_weekly = createDto.sale_outlet_weekly
        ? parseInt(createDto.sale_outlet_weekly, 10)
        : null;

      // Validate required fields
      this.validateRequiredFields(createDto);

      // Validate user exists
      const user = await this.validateUser(createDto.user_id);

      if (createDto.survey_outlet_id) {
        createDto.status_approval = 0;
        createDto.status = createDto.status || 202;
      }

      if (createDto.outlet_id) {
        if (createDto.status === 200) {
          createDto.status_approval = 3;
        } else {
          createDto.status_approval = 0;
        }
      }

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
      createDto.photos = [];

      // Process photos if present
      if (createDto.photo) {
        createDto.photo = await this.s3Service.uploadCompressedImage(
          'activity',
          createDto.photo,
        );
        createDto.photos.push(createDto.photo);
      }

      if (createDto.photo_first) {
        createDto.photo_first = await this.s3Service.uploadCompressedImage(
          'activity',
          createDto.photo_first,
        );
        createDto.photos.push(createDto.photo_first);
      }

      if (createDto.photo_second) {
        createDto.photo_second = await this.s3Service.uploadCompressedImage(
          'activity',
          createDto.photo_second,
        );
        createDto.photos.push(createDto.photo_second);
      }

      if (createDto.photo_program) {
        createDto.photo_program = await this.s3Service.uploadCompressedImage(
          'activity-program',
          createDto.photo_program,
        );
      }

      if (createDto.range_facility) {
        // Parse range facility values with default 0
        const rangeFacility = {
          range_health_facilities:
            parseInt(createDto.range_facility.range_health_facilities, 10) || 0,
          range_work_place:
            parseInt(createDto.range_facility.range_work_place, 10) || 0,
          range_public_transportation_facilities:
            parseInt(
              createDto.range_facility.range_public_transportation_facilities,
              10,
            ) || 0,
          range_worship_facilities:
            parseInt(createDto.range_facility.range_worship_facilities, 10) ||
            0,
          range_playground_facilities:
            parseInt(
              createDto.range_facility.range_playground_facilities,
              10,
            ) || 0,
          range_educational_facilities:
            parseInt(
              createDto.range_facility.range_educational_facilities,
              10,
            ) || 0,
        };

        if (createDto.outlet_id) {
          await this.outletRepository.updateOutlet(
            createDto.outlet_id,
            rangeFacility,
          );
        } else if (createDto.survey_outlet_id) {
          await this.surveyOutletRepository.updateData(
            createDto.survey_outlet_id,
            {
              ...rangeFacility,
              latitude: createDto.latitude,
              longitude: createDto.longitude,
              photos: createDto.photo,
            },
          );
        }
      }

      // Create main activity record
      const [result] = await this.repository.create(createDto);

      // Update call plan schedule status
      await this.updateCallPlanSchedule(result);

      return result;
    } catch (error) {
      logger.error('Error in create activity:', error.message, error.stack);
      if (
        error instanceof HttpException ||
        error instanceof BadRequestException
      ) {
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

  private async processPhotos(photos: any[]): Promise<[string, string]> {
    console.log(photos);
    // Handle case where photos is not an array
    if (!Array.isArray(photos)) {
      throw new BadRequestException(
        await this.i18n.translate('translation.Photos must be an array'),
      );
    }

    // Initialize result array with empty strings
    let result: [string, string] = ['', ''];

    // Process photos sequentially to maintain order
    for (let i = 0; i < Math.min(photos.length, 2); i++) {
      try {
        const photo = photos[i];

        // Basic validation of photo object
        if (!photo || !photo.buffer || !photo.mimetype) {
          throw new Error('Invalid photo data structure');
        }

        // Validate mimetype
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(photo.mimetype)) {
          throw new Error('Invalid image format - must be JPG or PNG');
        }

        console.log(photo);

        const photoUrl = await this.s3Service.uploadCompressedImage(
          'activity',
          photo,
        );
        result[i] = photoUrl;
      } catch (error) {
        console.error('Photo processing error:', error);
        throw new BadRequestException(
          await this.i18n.translate('translation.Failed to process photo'),
        );
      }
    }
    return result;
  }

  private async updateCallPlanSchedule(result: any) {
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
      if (
        error instanceof HttpException ||
        error instanceof BadRequestException
      ) {
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
    page: string = '1',
    limit: string = '10',
    searchTerm: string = '',
    filter: any = {},
  ) {
    try {
      const intPage = parseInt(page);
      const intLimit = parseInt(limit);
      return await this.repository.getAllActive(
        intPage,
        intLimit,
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

  async updateStatusApproval(
    id: number,
    updateDto: UpdateStatusApprovalDto,
    accessToken: string,
  ) {
    try {
      const decoded = this.jwtService.verify(accessToken);
      if (!decoded) {
        throw new NotFoundException(
          await this.i18n.translate('translation.User not found'),
        );
      }
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
        updateDto.status_approval === STATUS_APPROVED
      ) {
        await this.outletRepository.updateOutletStatus(activity.outlet_id, {
          is_active: 0,
          remarks: 'Outlet Tutup Permanen',
          updated_by: decoded.email,
          updated_at: new Date(),
        });
      }

      if (
        activity.surveyOutlet &&
        updateDto.status_approval === STATUS_APPROVED
      ) {
        const findOutlet = await this.outletRepository.findByCode(activity.surveyOutlet.outlet_code);
        if (findOutlet) {
          throw new HttpException(
            await this.i18n.translate('translation.Outlet already exists'),
            HttpStatus.BAD_REQUEST,
          );
        }
        // const CONCAT_AREA_BRAND_TYPE = activity.surveyOutlet.area + '-' + activity.surveyOutlet.brand + '-' + activity.surveyOutlet.amo_brand_type;
        // const findBatchTarget = await this.batchTargetRepository.findBatchAmoBrandType(CONCAT_AREA_BRAND_TYPE);
        // const findOutletSummary = await this.batchTargetRepository.findSummaryAmoBrandType(CONCAT_AREA_BRAND_TYPE);
        // if (findBatchTarget || findOutletSummary) {
        //    const allocationHo = findBatchTarget?.allocation_ho;
        //    const allocationOutlet = findOutletSummary?.allocation_outlet;
        // }
        const newOutlet = await this.outletRepository.createOutlet({
          name: activity.surveyOutlet.name,
          outlet_code: activity.surveyOutlet.outlet_code,
          brand: activity.surveyOutlet.brand,
          address_line: activity.surveyOutlet.address_line,
          sub_district: activity.surveyOutlet.sub_district,
          district: activity.surveyOutlet.district,
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
          range_health_facilities:
            activity.surveyOutlet.range_health_facilities,
          range_work_place: activity.surveyOutlet.range_work_place,
          range_public_transportation_facilities:
            activity.surveyOutlet.range_public_transportation_facilities,
          range_worship_facilities:
            activity.surveyOutlet.range_worship_facilities,
          range_playground_facilities:
            activity.surveyOutlet.range_playground_facilities,
          range_educational_facilities:
            activity.surveyOutlet.range_educational_facilities,
          old_outlet_id: activity.surveyOutlet.outlet_id,
          created_by: decoded.email,
          created_at: new Date(),
        });

        await this.outletRepository.updateOutlet(activity.surveyOutlet.outlet_id, {
          on_survey_complete: 1,
          updated_by: decoded.email,
          updated_at: new Date(),
        });

        if (newOutlet) {
          await this.surveyOutletRepository.updateData(
            activity.survey_outlet_id,
            {
              is_approved: updateDto.status_approval,
              updated_by: decoded.email,
              updated_at: new Date(),
            },
          );
        }
      } else {
        await this.surveyOutletRepository.updateData(
          activity.survey_outlet_id,
          {
            is_approved: updateDto.status_approval,
            updated_by: decoded.email,
            updated_at: new Date(),
          },
        );
      }

      const result = await this.repository.updateStatusApproval(id, updateDto);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
