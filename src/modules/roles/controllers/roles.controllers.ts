import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesService } from '../service/roles.service';
import { CreateRolesDto, UpdateRolesDto } from '../dtos/roles.dtos';
@ApiTags('roles')
@Controller({
  version: '1',
  path: '/roles',
})
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
  @Post(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRolesDto: UpdateRolesDto,
  ) {
    return this.rolesService.updateRoles(id, updateRolesDto);
  }
  @ApiBearerAuth('accessToken')
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() request: Request) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    console.log(accessToken);
    return this.rolesService.deleteRoles(id, accessToken);
  }
  @ApiBearerAuth('accessToken')
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('searchTerm') searchTerm: string = '',
  ) {
    if (page) {
      return this.rolesService.getAllActiveRoles(page, limit, searchTerm);
    } else {
      return this.rolesService.getAllRolesList();
    }
  }
}
