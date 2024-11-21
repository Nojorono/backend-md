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
import { CreateBrandDto, UpdateBrandDto } from '../dtos/brand.dtos';
import { BrandService } from '../service/brand.service';
@ApiTags('roles')
@Controller({
  version: '1',
  path: '/brand',
})
export class BrandControllers {
  constructor(private readonly brandService: BrandService) {}

  @ApiBearerAuth('accessToken')
  @Post()
  async create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandService.createData(createBrandDto);
  }
  @ApiBearerAuth('accessToken')
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.brandService.getDataById(id);
  }
  @ApiBearerAuth('accessToken')
  @Post(':id')
  async update(
    @Param('id') id: number,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return this.brandService.updateData(id, updateBrandDto);
  }
  @ApiBearerAuth('accessToken')
  @Delete(':id')
  async remove(@Param('id') id: number, @Req() request: Request) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.brandService.deleteData(id, accessToken);
  }
  @ApiBearerAuth('accessToken')
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('searchTerm') searchTerm: string = '',
  ) {
    return this.brandService.getAllActive(page, limit, searchTerm);
  }
  @ApiBearerAuth('accessToken')
  @Get('all')
  async getAll() {
    return this.brandService.getAll();
  }
}
