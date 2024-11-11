// src/user/user.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dtos';
import { UserRepo } from '../repository/user.repo';
import { MessagePattern } from '@nestjs/microservices';
import { Request } from 'express';

@ApiTags('user')
@Controller({
  version: '1',
  path: '/user',
})
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userRepo: UserRepo,
  ) {}
  @ApiBearerAuth('accessToken')
  @ApiQuery({ name: 'region', required: false, type: String })
  @ApiQuery({ name: 'area', required: false, type: String })
  @Get('get-md')
  public async getUserWithRole(
    @Query('region') region?: string,
    @Query('area') area?: any,
  ) {
    try {
      return await this.userRepo.getUserWithRole(region, area);
    } catch (error) {
      throw new HttpException(
        'Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @ApiBearerAuth('accessToken')
  @Get()
  public async getAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('searchTerm') searchTerm: string = '',
    @Req() request: Request,
  ) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return await this.userService.getAllWithPaginate(
      page,
      limit,
      searchTerm,
      accessToken,
    );
  }
  @ApiBearerAuth('accessToken')
  @Post()
  public async create(
    @Body() createUserDto: CreateUserDto,
    @Req() request: Request,
  ) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return await this.userService.store(createUserDto, accessToken);
  }
  @ApiBearerAuth('accessToken')
  @MessagePattern('getUserById')
  @Get(':id')
  public async getById(@Param('id') id: string) {
    return await this.userRepo.getUserById(id);
  }
  @ApiBearerAuth('accessToken')
  @Post(':id')
  public async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request,
  ) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return await this.userService.update(id, updateUserDto, accessToken);
  }
  @ApiBearerAuth('accessToken')
  @Delete(':id')
  public async delete(@Param('id') id: string) {
    return await this.userRepo.softDeleteUser(id);
  }
}
