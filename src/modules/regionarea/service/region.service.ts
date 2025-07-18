import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RegionRepository } from '../repository/region.repository';
import { CreateRegionDto, UpdateRegionDto } from '../dtos/region.dtos';
import { logger } from 'nestjs-i18n';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RegionService {
  constructor(
    private readonly RegionRepository: RegionRepository,
    private readonly jwtService: JwtService,
  ) {}

  async getAllData() {
    return this.RegionRepository.getAllData();
  }

  async createData(createDto: CreateRegionDto) {
    try {
      createDto.name = createDto.name.toUpperCase();
      const findRegion = await this.RegionRepository.getByName(createDto.name);
      if (findRegion[0]) {
        if (findRegion[0].deleted_at !== null) {
          await this.RegionRepository.deleteForce(findRegion[0].id);
        } else {
          throw new HttpException('Region already exists', 400);
        }
      } else {
        return await this.RegionRepository.create(createDto);
      }
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
    const decoded = this.jwtService.verify(accessToken);
    return this.RegionRepository.delete(id, decoded.email);
  }

  async getAllActiveData(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    return this.RegionRepository.getAllActive(page, limit, searchTerm);
  }
}
