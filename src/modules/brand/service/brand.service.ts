import { Injectable } from '@nestjs/common';
import { UserRepo } from '../../user/repository/user.repo';
import { CreateBrandDto, UpdateBrandDto } from '../dtos/brand.dtos';
import { BrandRepository } from '../repository/brand.repository';

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly userRepository: UserRepo,
  ) {}

  async createData(createBrandDto: CreateBrandDto) {
    return this.brandRepository.create(createBrandDto);
  }

  async getDataById(id: number) {
    return this.brandRepository.getById(id);
  }

  async updateData(id: number, updateBrandDto: UpdateBrandDto) {
    return this.brandRepository.update(id, updateBrandDto);
  }

  async deleteData(id: number, accessToken: string): Promise<void> {
    const user = await this.userRepository.findByToken(accessToken);
    return this.brandRepository.delete(id, user.email);
  }

  async getAllActive(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    return this.brandRepository.getAllActive(page, limit, searchTerm);
  }
}
