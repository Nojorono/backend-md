import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { NotificationsService } from '../service/notifications.service';
import { CreateDto, UpdateDto } from '../dtos/notifications.dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('notification')
@Controller({
  version: '1',
  path: '/notification',
})
export class NotificationsControllers {
    constructor(private readonly NotificationsService: NotificationsService) {}

  @ApiBearerAuth('accessToken')
  @Post()
  async create(@Body() CreateDto: CreateDto, @Req() request: Request) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.NotificationsService.create(CreateDto, accessToken);
  }
  
  // @ApiBearerAuth('accessToken')
  // @Get('activity/:id')
  // async findOne(@Param('id') id: number) {
  //   return this.NotificationsService.getByUserId(id);
  // }

  @ApiBearerAuth('accessToken')
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() UpdateDto: UpdateDto,
    @Req() request: Request,
  ) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.NotificationsService.update(id, UpdateDto, accessToken);
  }

  @ApiBearerAuth('accessToken')
  @Delete(':id')
  async remove(@Param('id') id: number, @Req() request: Request) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.NotificationsService.delete(id, accessToken);
  }

  @ApiBearerAuth('accessToken')
  @Get()
  async findAll(
    @Query('userId') userId: number,
  ) {
    return this.NotificationsService.getAll(userId);
  }
}
