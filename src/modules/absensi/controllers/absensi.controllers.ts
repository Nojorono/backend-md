import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AbsensiService } from '../service/absensi.service';
import { CreateDto, UpdateDto } from '../dtos/absensi.dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('absensi')
@Controller({
  version: '1',
  path: '/absensi',
})
export class AbsensiControllers {
  constructor(private readonly absensiService: AbsensiService) {}

  @ApiBearerAuth('accessToken')
  @Post()
  async create(@Body() CreateDto: CreateDto) {
    try {
      return this.absensiService.create(CreateDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @ApiBearerAuth('accessToken')
  @Put()
  async update(@Body() UpdateDto: UpdateDto) {
    try {
      return this.absensiService.update(UpdateDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @ApiBearerAuth('accessToken')
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('searchTerm') searchTerm: string = '',
    @Query('filter') filter: { area: string; region: string } = { area: '', region: '' },
  ) {
    try {
      return this.absensiService.getAll(page, limit, searchTerm, filter);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
