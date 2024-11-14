import { Injectable } from '@nestjs/common';
import { UserRepo } from '../../user/repository/user.repo';
import { CreateSioDto, UpdateSioDto } from '../dtos/sio.dtos';
import { SioRepository } from '../repository/sio.repository';

@Injectable()
export class SioService {
  constructor(
    private readonly repository: SioRepository,
    private readonly userRepository: UserRepo,
  ) {}

  async createData(createDto: CreateSioDto) {
    return this.repository.create(createDto);
  }

  async getDataById(id: number) {
    return this.repository.getById(id);
  }

  async updateData(id: number, updateDto: UpdateSioDto) {
    return this.repository.update(id, updateDto);
  }

  async deleteData(id: number, accessToken: string): Promise<void> {
    const user = await this.userRepository.findByToken(accessToken);
    return this.repository.delete(id, user.email);
  }

  async getAllActive(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    return this.repository.getAllActive(page, limit, searchTerm);
  }
}
