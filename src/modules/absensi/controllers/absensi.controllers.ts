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
import { CreateDto, TimezoneDto, UpdateDto } from '../dtos/absensi.dtos';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { string } from 'zod';

@ApiTags('absensi')
@Controller({
  version: '1',
  path: '/absensi',
})
export class AbsensiControllers {
  constructor(private readonly absensiService: AbsensiService) {}

  @ApiBearerAuth('accessToken')
  @Post()
  @ApiOperation({ summary: 'Create a new attendance record' })
  @ApiBody({ type: CreateDto })
  @ApiConsumes('multipart/form-data')
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
  @ApiOperation({ summary: 'Update an attendance record' })
  @ApiBody({ type: UpdateDto })
  @ApiConsumes('multipart/form-data')
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
  @Get('today/:userId')
  async findToday(@Param('userId') userId: string) {
    return this.absensiService.findToday(userId);
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

  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: 'Find today timezone' })
  @ApiBody({ type: TimezoneDto })
  @Post('today-timezone')
  async findTodayTimezone(@Body() body: TimezoneDto) {
    return this.absensiService.findTodayTimezone(body.timezone);
  }
}
