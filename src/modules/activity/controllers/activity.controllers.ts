import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Req,
  Put,
  BadRequestException,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiConsumes, ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import {
  UpdateMdActivityDto,
  UpdateStatusApprovalDto,
} from '../dtos/activitymd.dtos';
import { ActivityService } from '../service/activity.service';
import { Public } from 'src/decorators/public.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { QueueService } from '../service/queue.service';
@ApiTags('activity')
@Controller({
  version: '1',
  path: '/activity',
})
export class ActivityControllers {
  constructor(
    private readonly service: ActivityService,
    private readonly queueService: QueueService,
  ) {}

  @ApiBearerAuth('accessToken')
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.service.getDataById(id);
  }

  @ApiBearerAuth('accessToken')
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateMdActivityDto,
  ) {
    return this.service.updateData(id, updateDto);
  }

  @ApiBearerAuth('accessToken') 
  @Put('status/:id')
  async updateStatusApproval(
    @Param('id') id: number,
    @Body() updateDto: UpdateStatusApprovalDto,
  ) {
    return this.service.updateStatusApproval(id, updateDto);
  }

  @ApiBearerAuth('accessToken')
  @Delete(':id')
  async remove(@Param('id') id: number, @Req() request: Request) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.service.deleteData(id, accessToken);
  }

  @ApiBearerAuth('accessToken')
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('searchTerm') searchTerm?: string,
    @Query('filter') filter?: any,
  ) {
    return this.service.getAllActive(page, limit, searchTerm, filter);
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new activity' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['user_id', 'call_plan_id', 'call_plan_schedule_id'],
      properties: {
        user_id: { type: 'integer', description: 'User ID is required' },
        call_plan_id: { type: 'integer', description: 'Call Plan ID is required' },
        call_plan_schedule_id: { type: 'integer', description: 'Call Plan Schedule ID is required' },
        outlet_id: { type: 'integer', nullable: true, description: 'Optional Outlet ID' },
        survey_outlet_id: { type: 'integer', nullable: true, description: 'Optional Survey Outlet ID' },
        program_id: { type: 'integer', nullable: true, description: 'Optional Program ID' },
        status: { type: 'integer', nullable: true, default: 0, description: 'Activity status' },
        status_approval: { type: 'integer', nullable: true, default: 0, description: 'Approval status' },
        area: { type: 'string', maxLength: 100, description: 'Area name is required' },
        region: { type: 'string', maxLength: 100, description: 'Region name is required' },
        brand: { type: 'string', maxLength: 100, description: 'Brand name is required' },
        type_sio: { type: 'string', maxLength: 100, description: 'SIO type is required' },
        photos: { 
          type: 'array', 
          items: { type: 'string', format: 'binary' },
          description: 'Optional activity photos (max 2MB each)'
        },
        start_time: { 
          type: 'string', 
          format: 'date-time',
          description: 'Activity start time is required' 
        },
        end_time: { 
          type: 'string', 
          format: 'date-time',
          description: 'Activity end time is required'
        },
        latitude: { type: 'string', maxLength: 100, description: 'Optional latitude' },
        longitude: { type: 'string', maxLength: 100, description: 'Optional longitude' },
        notes: { type: 'string', description: 'Optional activity notes' },
        photo_program: { 
          type: 'string', 
          format: 'binary',
          description: 'Optional program photo (max 2MB)'
        },
        sale_outlet_weekly: {
          type: 'integer',
          description: 'Optional sale outlet weekly'
        },
        range_facility: {
          type: 'object',
          properties: {
            range_health_facilities: { type: 'integer' },
            range_work_place: { type: 'integer' },
            range_public_transportation_facilities: { type: 'integer' },
            range_worship_facilities: { type: 'integer' },
            range_playground_facilities: { type: 'integer' },
            range_educational_facilities: { type: 'integer' }
          },
          description: 'Optional range facility data'
        }
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'photos', maxCount: 1 },
    { name: 'photo_program', maxCount: 1 }
  ], {
    limits: {
      fileSize: 10 * 1024 * 1024 // Reduced to 2MB
    }
  }))
  async create(
    @Body() createDto: any,
    @UploadedFiles() files: { 
      photos?: Express.Multer.File[],
      photo_program?: Express.Multer.File[]
    }
  ) {
    try {
      // Add files to DTO if present
      if (files?.photos) {
        createDto.photos = files.photos;
      }
      if (files?.photo_program) {
        createDto.photo_program = files.photo_program;
      }
      // Use queue service for async processing
      return this.queueService.addToActivityQueue(createDto);
      
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        success: false,
        message: error.message,
        errors: error.response?.message || ['Failed to create activity']
      });
    }
  }
}
