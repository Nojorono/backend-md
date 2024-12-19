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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AbsensiService } from '../service/absensi.service';
import { CreateDto, UpdateDto } from '../dtos/absensi.dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('absensi')
@Controller({
  version: '1',
  path: '/absensi',
})
export class AbsensiControllers {
  constructor(private readonly absensiService: AbsensiService) {}

  @ApiBearerAuth('accessToken')
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(@Body() CreateDto: any, @UploadedFile() file: Express.Multer.File) {
    try {
      const result = await this.absensiService.create(CreateDto, file);
      if (!result) {
        throw new BadRequestException('Failed to create attendance record');
      }
      return result;
    } catch (error) {
      throw new BadRequestException(error.response);
    }
  }

  @ApiBearerAuth('accessToken')
  @Put()
  @UseInterceptors(FileInterceptor('file'))
  async update(@Body() UpdateDto: any, @UploadedFile() file: Express.Multer.File) {
    try {
      const result = await this.absensiService.update(UpdateDto, file);
      if (!result) {
        throw new BadRequestException('Failed to update attendance record');
      }
      return result;
    } catch (error) {
      throw new BadRequestException(error.response);
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
      throw new BadRequestException(error.response);
    }
  }
}
