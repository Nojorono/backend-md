import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateMdActivityDto,
  UpdateMdActivityDto,
} from '../dtos/activitymd.dtos';
import { ActivityService } from '../service/activity.service';
@ApiTags('activity')
@Controller({
  version: '1',
  path: '/activity',
})
export class ActivityControllers {
  constructor(private readonly service: ActivityService) {}

  @ApiBearerAuth('accessToken')
  @Post()
  async create(@Body() createDto: CreateMdActivityDto) {
    return this.service.createData(createDto);
  }
  @ApiBearerAuth('accessToken')
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.service.getDataById(id);
  }
  @ApiBearerAuth('accessToken')
  @Post(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdateMdActivityDto,
  ) {
    return this.service.updateData(id, updateDto);
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
    @Query('searchTerm') searchTerm: string = '',
  ) {
    return this.service.getAllActive(page, limit, searchTerm);
  }
}
