import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from '../service/roles.service';
import { CreateRolesDto, UpdateRolesDto } from '../dtos/roles.dtos';

@Controller('roles')
export class RolesControllers {
  constructor(private readonly rolesService: RolesService) {}
  @ApiBearerAuth('accessToken')
  @Post()
  async create(@Body() createRolesDto: CreateRolesDto) {
    return this.rolesService.createRoles(createRolesDto);
  }
  @ApiBearerAuth('accessToken')
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.rolesService.getRolesById(id);
  }
  @ApiBearerAuth('accessToken')
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateRolesDto: UpdateRolesDto,
  ) {
    return this.rolesService.updateRoles(id, updateRolesDto);
  }
  @ApiBearerAuth('accessToken')
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.rolesService.deleteRoles(id);
  }
  @ApiBearerAuth('accessToken')
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('searchTerm') searchTerm: string = '',
  ) {
    return this.rolesService.getAllActiveRoles(page, limit, searchTerm);
  }
}
