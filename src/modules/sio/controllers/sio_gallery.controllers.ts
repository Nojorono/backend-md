import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Body,
    Query,
    Req,
    UseInterceptors,
    UploadedFile,
  } from '@nestjs/common';
  import { Request } from 'express';
  import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
  import { CreateSioGalleryDto, UpdateSioGalleryDto } from '../dtos/sio_gallery.dtos';
  import { SioGalleryService } from '../service/sio_gallery.service';
import { FileInterceptor } from '@nestjs/platform-express';

  @ApiTags('sio-gallery')
  @Controller({
    version: '1',
    path: '/sio-gallery',
  })
  export class SioGalleryControllers {
    constructor(private readonly service: SioGalleryService) {}
  
    @ApiBearerAuth('accessToken')
    @Get('all')
    async getAll() {
      return this.service.getAll();
    }
    @ApiBearerAuth('accessToken')
    @Post()
    @UseInterceptors(FileInterceptor('photo'))
    async create(@Body() createDto: CreateSioGalleryDto, @UploadedFile() file: Express.Multer.File) {
      return this.service.createData(createDto, file);
    }
    @ApiBearerAuth('accessToken')
    @Get(':id')
    async findOne(@Param('id') id: number) {
      return this.service.getDataById(id);
    }
    @ApiBearerAuth('accessToken')
    @Post(':id')
    async update(@Param('id') id: number, @Body() updateDto: UpdateSioGalleryDto) {
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
  