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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dtos';
import { UserRepo } from '../repository/user.repo';
import { MessagePattern } from '@nestjs/microservices';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

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
  public async getMdRole(
    @Query('region') region?: string,
    @Query('area') area?: string,
  ) {
    try {
      return await this.userRepo.getMdRole(region, area);
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
    @Query('filter')
    filter: { area: string; region: string } = { area: '', region: '' },
    @Req() request: Request,
  ) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return await this.userService.getAllWithPaginate(
      accessToken,
      page,
      limit,
      searchTerm,
      filter,
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
  @UseInterceptors(FileInterceptor('file'))
  public async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: Request,
  ) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return await this.userService.update(accessToken, id, updateUserDto, file);
  }
  @ApiBearerAuth('accessToken')
  @Delete(':id')
  public async delete(@Param('id') id: string) {
    return await this.userRepo.softDeleteUser(id);
  }
}
