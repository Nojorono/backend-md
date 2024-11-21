import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RegionRepository } from '../repository/region.repository';
import { UserRepo } from '../../user/repository/user.repo';
import { CreateRegionDto, UpdateRegionDto } from '../dtos/region.dtos';
import { logger } from 'nestjs-i18n';

@Injectable()
export class RegionService {
  constructor(
    private readonly RegionRepository: RegionRepository,
    private readonly userRepository: UserRepo,
  ) {}

  async createData(createDto: CreateRegionDto) {
    try {
      createDto.name = createDto.name.toUpperCase();
      return await this.RegionRepository.create(createDto);
    } catch (e) {
      logger.error('Error in create data:', e.message, e.stack);
      if (e instanceof HttpException) {
        throw e;
      }
      throw new InternalServerErrorException('Failed to create data');
    }
  }

  async getDataById(id: number) {
    return this.RegionRepository.getById(id);
  }

  async updateData(id: number, updateDto: UpdateRegionDto) {
    updateDto.name = updateDto.name.toUpperCase();
    return this.RegionRepository.update(id, updateDto);
  }

  async deleteData(id: number, accessToken: string): Promise<void> {
    const user = await this.userRepository.findByToken(accessToken);
    return this.RegionRepository.delete(id, user.email);
  }

  async getAllActiveData(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    return this.RegionRepository.getAllActive(page, limit, searchTerm);
  }
}
