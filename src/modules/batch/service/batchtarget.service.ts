import { Injectable } from '@nestjs/common';
import { UserRepo } from '../../user/repository/user.repo';
import {
  CreateBatchTargetDto,
  UpdateBatchTargetDto,
} from '../dtos/batchtarget.dtos';
import { BatchTargetRepository } from '../repository/batchtarget.repository';

@Injectable()
export class BatchTargetService {
  constructor(
    private readonly batchTargetRepository: BatchTargetRepository,
    private readonly userRepository: UserRepo,
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
    const user = await this.userRepository.findByToken(accessToken);
    return this.batchTargetRepository.delete(id, user.email);
  }

  async getAll(batchId: string = '') {
    return this.batchTargetRepository.getAll(batchId);
  }
}
