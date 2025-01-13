import {
    Controller,
    Post,
    Body,
    BadRequestException,
    Param,
  } from '@nestjs/common';
  import { ApiTags } from '@nestjs/swagger';
  import { ActivityBranchService } from '../service/activity.branch.service';
  import { ActivityBranchDto } from '../dtos/activity_branch.dtos';
  import { Public } from 'src/decorators/public.decorator';
  @ApiTags('activity-branch')
  @Controller({
    version: '1',
    path: '/activity-branch',
  })
  export class ActivityBranchControllers {
    constructor(
      private readonly service: ActivityBranchService,
    ) {}
  
    @Public()
    @Post(':call_plan_schedule_id')
    async create(@Param('call_plan_schedule_id') call_plan_schedule_id: number, @Body() createDto: ActivityBranchDto) {
      try {
        return this.service.createDataBranch(call_plan_schedule_id, createDto);
      } catch (error) {
        if (error instanceof BadRequestException) {
          console.error('Validation failed:', error.message);
        }
        throw error;
      }
    }
  }
  