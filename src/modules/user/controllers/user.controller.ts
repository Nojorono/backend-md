// src/user/user.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
  @ApiBearerAuth('accessToken')
  @Post('get-role/:username')
  public async getUserWithRole(@Param('username') username: string) {
    return await this.userRepo.getUserWithRole(username);
  }
}
