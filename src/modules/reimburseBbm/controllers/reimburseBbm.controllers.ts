import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  HttpException,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ReimburseBbmService } from '../service/reimburseBbm.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateDto, UpdateDto } from '../dtos/reimburseBbm.dtos';
@ApiTags('reimburse-bbm')
@Controller({
  version: '1',
  path: '/reimburse-bbm',
})
export class ReimburseBbmControllers {
  constructor(private readonly reimburseBbmService: ReimburseBbmService) {}

  @ApiBearerAuth('accessToken')
  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        user_id: { type: 'string' },
        date_in: { type: 'string', format: 'date-time' },
        kilometer_in: { type: 'number' },
        photo_in: { type: 'string', format: 'binary' },
        description: { type: 'string' },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo_in'))
  async create(
    @Body() CreateDto: CreateDto,
    @UploadedFile() photo_in: Express.Multer.File,
  ) {
    try {
      const result = await this.reimburseBbmService.create(CreateDto, photo_in);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiBearerAuth('accessToken')
  @Put()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        date_out: { type: 'string', format: 'date-time' },
        kilometer_out: { type: 'number' },
        photo_out: { type: 'string', format: 'binary' },
        description: { type: 'string' },
        total_kilometer: { type: 'number' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('photo_out'))
  async update(
    @Body() UpdateDto: UpdateDto,
    @UploadedFile() photo_out: Express.Multer.File,
  ) {
    try {
      const result = await this.reimburseBbmService.update(
        UpdateDto,
        photo_out,
      );
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiBearerAuth('accessToken')
  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.reimburseBbmService.findByUserId(userId);
  }

  @ApiBearerAuth('accessToken')
  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('searchTerm') searchTerm: string = '',
    @Query('filter')
    filter: { area: string; region: string } = { area: '', region: '' },
  ) {
    try {
      return this.reimburseBbmService.getAll(page, limit, searchTerm, filter);
    } catch (error) {
      throw new BadRequestException(error.response);
    }
  }
}
