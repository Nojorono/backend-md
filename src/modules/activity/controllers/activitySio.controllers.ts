import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActivityService } from '../service/activity.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ActivitySioDto } from '../dtos/activity_sio.dtos';
import { Public } from 'src/decorators/public.decorator';

@ApiTags('activity-sio')
@Controller({
  version: '1',
  path: '/activity-sio',
})
export class ActivitySioControllers {
  constructor(private readonly service: ActivityService) {}

  @Public()
  @Post()
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
        file: {
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
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async create(
    @Body() createDto: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      console.log(createDto);
      // Convert activity_id from string to number if needed
      if (typeof createDto.activity_id === 'string') {
        createDto.activity_id = parseInt(createDto.activity_id, 10);
      }

      return await this.service.createDataSio(createDto, file);
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
