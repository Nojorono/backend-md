import { Injectable } from '@nestjs/common';
import { UserRepo } from '../../user/repository/user.repo';
import { CreateAreaDto, UpdateAreaDto } from '../dtos/area.dtos';
import { AreaRepository } from '../repository/area.repository';

@Injectable()
export class AreaService {
  constructor(
    private readonly AreaRepository: AreaRepository,
    private readonly userRepository: UserRepo,
  ) {}

  async createData(CreateAreaDto: CreateAreaDto) {
    return this.AreaRepository.create(CreateAreaDto);
  }

  async getDataById(id: number) {
    return this.AreaRepository.getById(id);
  }

  async updateData(id: number, updateRolesDto: UpdateAreaDto) {
    return this.AreaRepository.update(id, updateRolesDto);
  }

  async deleteData(id: string, accessToken: string): Promise<void> {
    const user = await this.userRepository.findByToken(accessToken);
    return this.AreaRepository.delete(id, user.email);
  }

  async getAll(batchId: string = '') {
    return this.AreaRepository.getAll(batchId);
  }
}
