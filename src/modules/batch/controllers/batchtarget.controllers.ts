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
import { BatchRepository } from '../repository/batch.repository';
import { BatchTargetService } from '../service/batchtarget.service';
import {
  CreateBatchTargetDto,
  UpdateBatchTargetDto,
} from '../dtos/batchtarget.dtos';
@ApiTags('roles')
@Controller({
  version: '1',
  path: '/batch-target',
})
export class BatchTargetControllers {
  constructor(
    private readonly batchTargetService: BatchTargetService,
    private readonly batchRepo: BatchRepository,
  ) {}
  @ApiBearerAuth('accessToken')
  @Post()
  async create(@Body() createBatchTargetDto: CreateBatchTargetDto) {
    return this.batchTargetService.createData(createBatchTargetDto);
  }
  @ApiBearerAuth('accessToken')
  @Post(':id')
  async update(
    @Param('id') id: number,
    @Body() updateBatchTargetDto: UpdateBatchTargetDto,
  ) {
    return this.batchTargetService.updateData(id, updateBatchTargetDto);
  }
  @ApiBearerAuth('accessToken')
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() request: Request) {
    const accessToken = request.headers.authorization?.split(' ')[1];
    return this.batchTargetService.deleteData(id, accessToken);
  }
  @ApiBearerAuth('accessToken')
  @Get(':batchId')
  async findAll(@Param('batchId') batchId: string = '') {
    console.log(batchId);
    return this.batchTargetService.getAll(batchId);
  }
}
