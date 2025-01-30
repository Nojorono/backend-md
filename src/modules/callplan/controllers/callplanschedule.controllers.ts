import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateCallPlanScheduleDto,
  UpdateCallPlanScheduleDto,
} from '../dtos/callplanschedule.dtos';
import { Request } from 'express';
import { CallPlanScheduleService } from '../service/callplanschedule.service';

@ApiTags('schedule-plan')
@Controller({
  version: '1',
  path: '/schedule-plan',
})
export class CallPlanScheduleControllers {
  constructor(private readonly callPlanService: CallPlanScheduleService) {}

  @ApiBearerAuth('accessToken')
  @Post()
  async createSchedule(
    @Body() createCallPlanScheduleDto: CreateCallPlanScheduleDto,
    @Req() request: Request,
  ) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.callPlanService.createCallPlanSchedule(
      createCallPlanScheduleDto,
      accessToken,
    );
  }

  @ApiBearerAuth('accessToken')
  @Put(':id')
  async updateSchedule(
    @Param('id') id: string,
    @Body() updateCallPlanScheduleDto: UpdateCallPlanScheduleDto,
    @Req() request: Request,
  ) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.callPlanService.updateCallPlanSchedule(
      id,
      updateCallPlanScheduleDto,
      accessToken,
    );
  }

  @ApiBearerAuth('accessToken')
  @Delete(':id')
  async removeSchedule(@Param('id') id: string, @Req() request: Request) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.callPlanService.deleteCallPlanSchedule(id, accessToken);
  }

  @ApiBearerAuth('accessToken')
  @Get(':id')
  async findListSchedule(
    @Param('id') id: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('searchTerm') searchTerm: string = '',
    @Query('userId') userId: number = null,
  ) {
    return this.callPlanService.getSchedules(
      id,
      page,
      limit,
      searchTerm,
      userId,
    );
  }

  @ApiBearerAuth('accessToken')
  @Get('md/:id')
  async getByIdUser(@Param('id') id: string) {
    return this.callPlanService.getByIdUser(id);
  }

  @ApiBearerAuth('accessToken')
  @Get('md-history/:id')
  async historyGetByIdUser(@Param('id') id: string) {
    return this.callPlanService.getByIdUser(id);
  }


}
