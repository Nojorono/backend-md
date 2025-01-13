import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UseInterceptors,
  UploadedFiles,
  Param,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActivitySioService } from '../service/activity.sio.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ActivitySioDto } from '../dtos/activity_sio.dtos';
import { Public } from 'src/decorators/public.decorator';

@ApiTags('activity-sio')
@Controller({
  version: '1',
  path: '/activity-sio',
})
export class ActivitySioControllers {
  constructor(private readonly service: ActivitySioService) {}

  @Public()
  @Post(':call_plan_schedule_id')
  @ApiOperation({ summary: 'Create a new SIO activity' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        activity_id: { type: 'number', description: 'Must be an integer' },
        name: {
          type: 'string',
          minLength: 2,
          maxLength: 100,
          description: 'Required, 2-100 characters',
        },
        description: {
          type: 'string',
          maxLength: 500,
          description: 'Optional, max 500 characters',
        },
        notes: {
          type: 'string',
          maxLength: 1000,
          description: 'Optional, max 1000 characters',
        },
        photo_before: {
          type: 'string',
          format: 'binary',
          description: 'Optional image file, max 5MB',
        },
        photo_after: {
          type: 'string',
          format: 'binary',
          description: 'Optional image file, max 5MB',
        },
      },
      required: ['activity_id', 'name'],
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'photo_before', maxCount: 1 },
        { name: 'photo_after', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB
        },
      },
    ),
  )
  async create(
    @Param('call_plan_schedule_id') call_plan_schedule_id: number,
    @Body() createDto: ActivitySioDto,
    @UploadedFiles()
    files: {
      photo_before?: Express.Multer.File[];
      photo_after?: Express.Multer.File[];
    },
  ) {
    try {
      return await this.service.createDataSio(
        call_plan_schedule_id,
        createDto,
        files,
      );
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message,
        errors: error.response?.message || [
          'Activity ID must be an integer',
          'Name is required and must be 2-100 characters',
          'Description cannot exceed 500 characters',
          'Notes cannot exceed 1000 characters',
          'Photo URL must be a valid URL',
          'File size cannot exceed 5MB',
        ],
      });
    }
  }
}
