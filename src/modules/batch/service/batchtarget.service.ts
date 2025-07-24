import { Injectable } from '@nestjs/common';
import {
  CreateBatchTargetDto,
  UpdateBatchTargetDto,
} from '../dtos/batchtarget.dtos';
import { BatchTargetRepository } from '../repository/batchtarget.repository';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class BatchTargetService {
  constructor(
    private readonly batchTargetRepository: BatchTargetRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createData(createDto: CreateBatchTargetDto) {
    return this.batchTargetRepository.create(createDto);
  }

  async getDataById(id: number) {
    return this.batchTargetRepository.getById(id);
  }

  async updateData(id: number, updateDto: UpdateBatchTargetDto) {
    return this.batchTargetRepository.update(id, updateDto);
  }

  async deleteData(id: number, accessToken: string): Promise<void> {
    const decoded = this.jwtService.verify(accessToken);
    return this.batchTargetRepository.delete(id, decoded.email);
  }

  async getAll(batchId: string = '') {
    return this.batchTargetRepository.getAll(batchId);
  }
}
