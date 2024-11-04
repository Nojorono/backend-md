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
import { CallPlanService } from '../service/callplan.service';
import { CreateCallPlanDto, UpdateCallPlanDto } from '../dtos/callplan.dtos';
import {
  CreateCallPlanScheduleDto,
  UpdateCallPlanScheduleDto,
} from '../dtos/callplanschedule.dtos';
import { Request } from 'express';

@ApiTags('call-plan')
@Controller({
  version: '1',
  path: '/call-plan',
})
export class CallPlanControllers {
  constructor(private readonly callPlanService: CallPlanService) {}

  @ApiBearerAuth('accessToken')
  @Post()
  async create(@Body() createCallPlanDto: CreateCallPlanDto) {
    return this.callPlanService.createCallPlan(createCallPlanDto);
  }

  @ApiBearerAuth('accessToken')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.callPlanService.getCallPlanById(id);
  }

  @ApiBearerAuth('accessToken')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCallPlanDto: UpdateCallPlanDto,
  ) {
    return this.callPlanService.updateCallPlan(id, updateCallPlanDto);
  }

  @ApiBearerAuth('accessToken')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.callPlanService.deleteCallPlan(id);
  }

  @ApiBearerAuth('accessToken')
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('searchTerm') searchTerm: string = '',
  ) {
    return this.callPlanService.getAll(page, limit, searchTerm);
  }

  @ApiBearerAuth('accessToken')
  @Post('schedule')
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
  @Put('schedule/:id')
  async updateSchedule(
    @Param('id') id: number,
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
  @Delete('schedule/:id')
  async removeSchedule(@Param('id') id: number, @Req() request: Request) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.callPlanService.deleteCallPlanSchedule(id, accessToken);
  }

  @ApiBearerAuth('accessToken')
  @Get('schedule/:id')
  async findListSchedule(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('searchTerm') searchTerm: string = '',
  ) {
    return this.callPlanService.getSchedules(id, page, limit, searchTerm);
  }

  @ApiBearerAuth('accessToken')
  @Get('schedule-md/:id')
  async getByIdUser(@Param('id') id: string) {
    return this.callPlanService.getByIdUser(id);
  }
}
