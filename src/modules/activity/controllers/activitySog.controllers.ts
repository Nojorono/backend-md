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
  import { ActivityService } from '../service/activity.service';
  import { ActivitySogDto } from '../dtos/activity_sog.dtos';
  import { Public } from 'src/decorators/public.decorator';
  @ApiTags('activity-sog')
  @Controller({
    version: '1',
    path: '/activity-sog',
  })
  export class ActivitySogControllers {
    constructor(
      private readonly service: ActivityService,
    ) {}
  
    @Public()
    @Post()
    async create(@Body() createDto: ActivitySogDto) {
      try {
        return this.service.createDataSog(createDto);
      } catch (error) {
        if (error instanceof BadRequestException) {
          console.error('Validation failed:', error.message);
        }
        throw error;
      }
    }
  }
  