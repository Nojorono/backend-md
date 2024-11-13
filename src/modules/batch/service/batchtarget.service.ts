import { Injectable } from '@nestjs/common';
import { UserRepo } from '../../user/repository/user.repo';
import { CreateBatchDto, UpdateBatchDto } from '../dtos/batch.dtos';
import { BatchTargetRepository } from '../repository/batchtarget.repository';

@Injectable()
export class BatchTargetService {
  constructor(
    private readonly batchTargetRepository: BatchTargetRepository,
    private readonly userRepository: UserRepo,
  ) {}

  async createData(createRolesDto: CreateBatchDto) {
    return this.batchTargetRepository.create(createRolesDto);
  }

  async getDataById(id: number) {
    return this.batchTargetRepository.getById(id);
  }

  async updateData(id: number, updateRolesDto: UpdateBatchDto) {
    return this.batchTargetRepository.update(id, updateRolesDto);
  }

  async deleteData(id: string, accessToken: string): Promise<void> {
    const user = await this.userRepository.findByToken(accessToken);
    return this.batchTargetRepository.delete(id, user.email);
  }

  async getAll(batchId: string = '') {
    return this.batchTargetRepository.getAll(batchId);
  }
}
