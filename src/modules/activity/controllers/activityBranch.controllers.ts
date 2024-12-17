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
  import { ActivityBranchDto } from '../dtos/activity_branch.dtos';
  import { Public } from 'src/decorators/public.decorator';
  @ApiTags('activity-branch')
  @Controller({
    version: '1',
    path: '/activity-branch',
  })
  export class ActivityBranchControllers {
    constructor(
      private readonly service: ActivityService,
    ) {}
  
    @Public()
    @Post()
    async create(@Body() createDto: ActivityBranchDto) {
      try {
        return this.service.createDataBranch(createDto);
      } catch (error) {
        if (error instanceof BadRequestException) {
          console.error('Validation failed:', error.message);
        }
        throw error;
      }
    }
  }
  