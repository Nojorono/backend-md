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
import { CreateProgramDto, UpdateProgramDto } from '../dtos/program.dtos';
import { ProgramService } from '../service/program.service';
@ApiTags('program')
@Controller({
  version: '1',
  path: '/program',
})
export class ProgramControllers {
  constructor(private readonly programService: ProgramService) {}

  @ApiBearerAuth('accessToken')
  @Get('all')
  async getAll() {
    return this.programService.getAll();
  }
  @ApiBearerAuth('accessToken')
  @Post()
  async create(@Body() createProgramDto: CreateProgramDto) {
    return this.programService.createData(createProgramDto);
  }
  @ApiBearerAuth('accessToken')
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.programService.getDataById(id);
  }
  @ApiBearerAuth('accessToken')
  @Post(':id')
  async update(
    @Param('id') id: number,
    @Body() updateProgramDto: UpdateProgramDto,
  ) {
    return this.programService.updateData(id, updateProgramDto);
  }
  @ApiBearerAuth('accessToken')
  @Delete(':id')
  async remove(@Param('id') id: number, @Req() request: Request) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.programService.deleteData(id, accessToken);
  }
  @ApiBearerAuth('accessToken')
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('searchTerm') searchTerm: string = '',
  ) {
    return this.programService.getAllActive(page, limit, searchTerm);
  }
}
