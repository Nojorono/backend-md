import { Injectable } from '@nestjs/common';
import { CreateSioDto, UpdateSioDto } from '../dtos/sio.dtos';
import { SioRepository } from '../repository/sio.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SioService {
  constructor(
    private readonly repository: SioRepository,
    private readonly jwtService: JwtService,
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
    const decoded = this.jwtService.verify(accessToken);
    return this.repository.delete(id, decoded.email);
  }

  async getAllActive(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    return this.repository.getAllActive(page, limit, searchTerm);
  }

  async getAll() {
    return this.repository.getAll();
  }
}
