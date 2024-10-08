// src/user/user.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dtos';

@ApiTags('user')
@Controller({
  version: '1',
  path: '/user',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.createUser(createUserDto);
  }

  @Get(':id')
  async getById(@Param('id') id: number) {
    return await this.userService.getUserById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.userService.deleteUser(id);
  }

  @Post('get-role/:username')
  async getUserWithRole(@Param('username') username: string) {
    return await this.userService.getUserWithRole(username);
  }
}
