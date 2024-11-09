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
  async create(
    @Body() createCallPlanDto: CreateCallPlanDto,
    @Req() request: Request,
  ) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.callPlanService.createCallPlan(createCallPlanDto, accessToken);
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
    @Req() request: Request,
  ) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.callPlanService.updateCallPlan(
      id,
      updateCallPlanDto,
      accessToken,
    );
  }

  @ApiBearerAuth('accessToken')
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() request: Request) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.callPlanService.deleteCallPlan(id, accessToken);
  }

  @ApiBearerAuth('accessToken')
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('searchTerm') searchTerm: string = '',
    @Req() request: Request,
  ) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.callPlanService.getAll(accessToken, page, limit, searchTerm);
  }
}
