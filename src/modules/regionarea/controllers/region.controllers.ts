import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RegionService } from '../service/region.service';
import { CreateRegionDto, UpdateRegionDto } from '../dtos/region.dtos';
import { RegionRepository } from '../repository/region.repository';

@ApiTags('region')
@Controller({
  version: '1',
  path: '/region',
})
export class RegionControllers {
  constructor(
    private readonly RegionService: RegionService,
    private readonly RegionRepository: RegionRepository,
  ) {}

  @ApiBearerAuth('accessToken')
  @Get('find-last')
  async findLast() {
    return this.RegionRepository.findLastInsert();
  }

  @ApiBearerAuth('accessToken')
  @Post()
  async create(@Body() createDto: CreateRegionDto) {
    return this.RegionService.createData(createDto);
  }

  @ApiBearerAuth('accessToken')
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.RegionService.getDataById(id);
  }

  @ApiBearerAuth('accessToken')
  @Post(':id')
  async update(@Param('id') id: number, @Body() updateDto: UpdateRegionDto) {
    return this.RegionService.updateData(id, updateDto);
  }

  @ApiBearerAuth('accessToken')
  @Delete(':id')
  async remove(@Param('id') id: number, @Req() request: Request) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.RegionService.deleteData(id, accessToken);
  }

  @ApiBearerAuth('accessToken')
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('searchTerm') searchTerm: string = '',
  ) {
    return this.RegionService.getAllActiveData(page, limit, searchTerm);
  }
}
