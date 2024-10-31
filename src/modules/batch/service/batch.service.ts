import { Injectable } from '@nestjs/common';
import { BatchRepository } from '../repository/batch.repository';
import { UserRepo } from '../../user/repository/user.repo';
import { CreateBatchDto, UpdateBatchDto } from '../dtos/batch.dtos';

@Injectable()
export class BatchService {
  constructor(
    private readonly batchRepository: BatchRepository,
    private readonly userRepository: UserRepo,
  ) {}

  async createRoles(createRolesDto: CreateBatchDto) {
    console.log(createRolesDto);
    return this.batchRepository.create(createRolesDto);
  }

  async getRolesById(id: number) {
    return this.batchRepository.getById(id);
  }

  async updateRoles(id: string, updateRolesDto: UpdateBatchDto) {
    return this.batchRepository.update(id, updateRolesDto);
  }

  async deleteRoles(id: string, accessToken: string): Promise<void> {
    const user = await this.userRepository.findByToken(accessToken);
    return this.batchRepository.delete(id, user.email);
  }
  async getAllRolesList() {
    return this.batchRepository.getList();
  }
  async getAllActiveRoles(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    return this.batchRepository.getAllActive(page, limit, searchTerm);
  }
}
