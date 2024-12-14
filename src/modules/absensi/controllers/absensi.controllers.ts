import {
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
    return this.absensiService.create(CreateDto);
  }

  @ApiBearerAuth('accessToken')
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() UpdateDto: UpdateDto,
  ) {
    return this.absensiService.update(id, UpdateDto);
  }

  @ApiBearerAuth('accessToken')
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('searchTerm') searchTerm: string = '',
    @Query('filter') filter: { area: string; region: string } = { area: '', region: '' },
  ) {
    return this.absensiService.getAll(page, limit, searchTerm, filter);
  }
}
