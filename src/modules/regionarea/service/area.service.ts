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
    CreateAreaDto.area = CreateAreaDto.area.toUpperCase();
    return this.AreaRepository.create(CreateAreaDto);
  }

  async getDataById(id: number) {
    return this.AreaRepository.getById(id);
  }

  async updateData(id: number, updateRolesDto: UpdateAreaDto) {
    console.log(updateRolesDto);
    updateRolesDto.area = updateRolesDto.area.toUpperCase();
    updateRolesDto.created_at = new Date(updateRolesDto.created_at);
    updateRolesDto.updated_at = new Date();
    return this.AreaRepository.update(id, updateRolesDto);
  }

  async deleteData(id: number, accessToken: string): Promise<void> {
    const user = await this.userRepository.findByToken(accessToken);
    return this.AreaRepository.delete(id, user.email);
  }

  async getAll(id: number) {
    return this.AreaRepository.getAll(id);
  }
}
