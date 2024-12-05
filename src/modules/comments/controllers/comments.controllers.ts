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
import { CommentsService } from '../service/comments.service';
import { CreateDto, UpdateDto } from '../dtos/comments.dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('comment')
@Controller({
  version: '1',
  path: '/comment',
})
export class CommentsControllers {
  constructor(private readonly CommentsService: CommentsService) {}

  @ApiBearerAuth('accessToken')
  @Post()
  async create(@Body() CreateDto: CreateDto, @Req() request: Request) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.CommentsService.create(CreateDto, accessToken);
  }
  
  @ApiBearerAuth('accessToken')
  @Get('activity/:id')
  async findOne(@Param('id') id: number) {
    return this.CommentsService.getByActivityId(id);
  }

  @ApiBearerAuth('accessToken')
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() UpdateDto: UpdateDto,
    @Req() request: Request,
  ) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.CommentsService.update(id, UpdateDto, accessToken);
  }

  @ApiBearerAuth('accessToken')
  @Delete(':id')
  async remove(@Param('id') id: number, @Req() request: Request) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.CommentsService.delete(id, accessToken);
  }

  @ApiBearerAuth('accessToken')
  @Get()
  async findAll(
    @Query('activityId') activityId: number,
  ) {
    return this.CommentsService.getAll(activityId);
  }
}
