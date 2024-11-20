import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RegionRepository } from '../repository/region.repository';
import { AreaService } from '../service/area.service';
import { CreateAreaDto, UpdateAreaDto } from '../dtos/area.dtos';

@ApiTags('area')
@Controller({
  version: '1',
  path: '/area',
})
export class AreaControllers {
  constructor(
    private readonly AreaService: AreaService,
    private readonly batchRepo: RegionRepository,
  ) {}
  @ApiBearerAuth('accessToken')
  @Post()
  async create(@Body() CreateAreaDto: CreateAreaDto) {
    return this.AreaService.createData(CreateAreaDto);
  }
  @ApiBearerAuth('accessToken')
  @Post(':id')
  async update(@Param('id') id: number, @Body() UpdateAreaDto: UpdateAreaDto) {
    return this.AreaService.updateData(id, UpdateAreaDto);
  }
  @ApiBearerAuth('accessToken')
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() request: Request) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.AreaService.deleteData(id, accessToken);
  }
  @ApiBearerAuth('accessToken')
  @Get(':id')
  async findAll(@Param('id') id: string = '') {
    return this.AreaService.getAll(id);
  }
}
