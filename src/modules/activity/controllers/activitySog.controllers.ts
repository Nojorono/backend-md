import {
    Controller,
    Post,
    Body,
    BadRequestException,
    Param,
  } from '@nestjs/common';
  import { ApiTags } from '@nestjs/swagger';
  import { ActivitySogService } from '../service/activity.sog.service';
  import { ActivitySogDto } from '../dtos/activity_sog.dtos';
  import { Public } from 'src/decorators/public.decorator';
  @ApiTags('activity-sog')
  @Controller({
    version: '1',
    path: '/activity-sog',
  })
  export class ActivitySogControllers {
    constructor(
      private readonly service: ActivitySogService,
    ) {}
  
    @Public()
    @Post(':call_plan_schedule_id')
    async create(@Param('call_plan_schedule_id') call_plan_schedule_id: number, @Body() createDto: ActivitySogDto) {
      try {
        return this.service.createDataSog(call_plan_schedule_id, createDto);
      } catch (error) {
        if (error instanceof BadRequestException) {
          console.error('Validation failed:', error.message);
        }
        throw error;
      }
    }
  }
  