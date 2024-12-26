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
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateMdActivityDto,
  UpdateMdActivityDto,
  UpdateStatusDto,
} from '../dtos/activitymd.dtos';
import { ActivityService } from '../service/activity.service';
import { Public } from 'src/decorators/public.decorator';
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
  async updateStatus(
    @Param('id') id: number,
    @Body() updateDto: UpdateStatusDto,
  ) {
    return this.service.updateStatus(id, updateDto);
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
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('searchTerm') searchTerm?: string,
    @Query('filter') filter?: any,
  ) {
    return this.service.getAllActive(page, limit, searchTerm, filter);
  }

  @Public()
  @Post()
  async create(@Body() createDto: CreateMdActivityDto) {
    try {
      // return this.queueService.addToActivityQueue(createDto);
      return this.service.createDataActivity(createDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        console.error('Validation failed:', error.message);
      }
      throw error;
    }
  }
}
