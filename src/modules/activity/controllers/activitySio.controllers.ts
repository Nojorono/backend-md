import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Param,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/decorators/public.decorator';
import { QueueService } from '../service/queue.service';

@ApiTags('activity-sio')
@Controller({
  version: '1',
  path: '/activity-sio',
})
export class ActivitySioControllers {
  constructor(
    private readonly queueService: QueueService
  ) {}

  @Public()
  @Post(':call_plan_schedule_id')
  @ApiOperation({ summary: 'Create a new SIO activity' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
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
      required: ['name'],
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
    @Body() createDto: any,
    @UploadedFiles()
    files: {
      photo_before?: Express.Multer.File[];
      photo_after?: Express.Multer.File[];
    },
  ) {
    try {
      const job = await this.queueService.addToActivitySioQueue({
        'call_plan_schedule_id': call_plan_schedule_id,
        'createDto': createDto,
        'files': files,
      });
      return job;
    } catch (error) {
      console.log('error', error);
    }
  }
}
