// src/user/user.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get, HttpException, HttpStatus,
  Param,
  Patch,
  Post, Query,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dtos';
import { UserRepo } from '../repository/user.repo';
import { MessagePattern } from '@nestjs/microservices';

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
  @Get('get-role')
  public async getUserWithRole(
    @Query('region') region?: string,
    @Query('area') area?: string,
  ) {
    try {
      const usersWithRole = await this.userRepo.getUserWithRole(region, area);
      console.log(usersWithRole);
      return usersWithRole;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @ApiBearerAuth('accessToken')
  @Get()
  public async getAll() {
    return await this.userService.getAllWithPaginate();
  }
  @ApiBearerAuth('accessToken')
  @Post()
  public async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.store(createUserDto);
  }
  @ApiBearerAuth('accessToken')
  @MessagePattern('getUserById')
  @Get(':id')
  public async getById(@Param('id') id: string) {
    return await this.userRepo.getUserById(id);
  }
  @ApiBearerAuth('accessToken')
  @Patch(':id')
  public async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userRepo.updateUser(id, updateUserDto);
  }
  @ApiBearerAuth('accessToken')
  @Delete(':id')
  public async delete(@Param('id') id: string) {
    return await this.userRepo.softDeleteUser(id);
  }
}
