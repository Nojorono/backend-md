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
import { BatchService } from '../service/batch.service';
import { CreateBatchDto, UpdateBatchDto } from '../dtos/batch.dtos';
import { BatchRepository } from '../repository/batch.repository';
@ApiTags('roles')
@Controller({
  version: '1',
  path: '/batch',
})
export class BatchControllers {
  constructor(
    private readonly batchService: BatchService,
    private readonly batchRepo: BatchRepository,
  ) {}
  @ApiBearerAuth('accessToken')
  @Get('find-last')
  async findLast() {
    return this.batchRepo.findLastInsert();
  }
  @ApiBearerAuth('accessToken')
  @Post()
  async create(@Body() createBatchDto: CreateBatchDto) {
    return this.batchService.createData(createBatchDto);
  }
  @ApiBearerAuth('accessToken')
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.batchService.getDataById(id);
  }
  @ApiBearerAuth('accessToken')
  @Post(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBatchDto: UpdateBatchDto,
  ) {
    return this.batchService.updateData(id, updateBatchDto);
  }
  @ApiBearerAuth('accessToken')
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() request: Request) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.batchService.deleteData(id, accessToken);
  }
  @ApiBearerAuth('accessToken')
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('searchTerm') searchTerm: string = '',
  ) {
    return this.batchService.getAllActiveData(page, limit, searchTerm);
  }
}
