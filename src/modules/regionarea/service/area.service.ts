import { Injectable } from '@nestjs/common';
import { CreateAreaDto, UpdateAreaDto } from '../dtos/area.dtos';
import { AreaRepository } from '../repository/area.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AreaService {
  constructor(
    private readonly AreaRepository: AreaRepository,
    private readonly jwtService: JwtService,
  ) {}

  async getAllData() {
    return this.AreaRepository.getAllData();
  }

  async createData(CreateAreaDto: CreateAreaDto) {
    CreateAreaDto.area = CreateAreaDto.area.toUpperCase();
    return this.AreaRepository.create(CreateAreaDto);
  }

  async getDataById(id: number) {
    return this.AreaRepository.getById(id);
  }

  async updateData(id: number, updateRolesDto: UpdateAreaDto) {
    updateRolesDto.area = updateRolesDto.area.toUpperCase();
    updateRolesDto.created_at = new Date(updateRolesDto.created_at);
    updateRolesDto.updated_at = new Date();
    return this.AreaRepository.update(id, updateRolesDto);
  }

  async deleteData(id: number, accessToken: string): Promise<void> {
    const decoded = this.jwtService.verify(accessToken);
    return this.AreaRepository.delete(id, decoded.email);
  }

  async getAll(id: number) {
    return this.AreaRepository.getAll(id);
  }
}
