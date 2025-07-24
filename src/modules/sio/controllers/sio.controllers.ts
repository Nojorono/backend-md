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
import { CreateSioDto, UpdateSioDto } from '../dtos/sio.dtos';
import { SioService } from '../service/sio.service';
@ApiTags('sio')
@Controller({
  version: '1',
  path: '/sio',
})
export class SioControllers {
  constructor(private readonly service: SioService) {}

  @ApiBearerAuth('accessToken')
  @Get('all')
  async getAll() {
    return this.service.getAll();
  }
  @ApiBearerAuth('accessToken')
  @Post()
  async create(@Body() createDto: CreateSioDto) {
    return this.service.createData(createDto);
  }
  @ApiBearerAuth('accessToken')
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.service.getDataById(id);
  }
  @ApiBearerAuth('accessToken')
  @Post(':id')
  async update(@Param('id') id: number, @Body() updateDto: UpdateSioDto) {
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
