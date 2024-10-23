import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';
import { CallPlanService } from '../service/callplan.service';
import { CreateCallPlanDto, UpdateCallPlanDto } from '../dtos/callplan.dtos';

@Controller('call-plan')
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
}
