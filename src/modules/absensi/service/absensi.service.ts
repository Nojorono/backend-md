import { Injectable } from '@nestjs/common';
import { AbsensiRepository } from '../repository/absensi.repository';
import { CreateDto, UpdateDto } from '../dtos/absensi.dtos';
import { UserRepo } from '../../user/repository/user.repo';

@Injectable()
export class AbsensiService {
  constructor(
    private readonly AbsensiRepository: AbsensiRepository,
    private readonly userRepository: UserRepo,
  ) {}

  async create(CreateDto: CreateDto) {
    const result = await this.AbsensiRepository.createData(CreateDto);
    return result;
  }

  async update(id: number, UpdateDto: UpdateDto) {
    return this.AbsensiRepository.updateData(id, UpdateDto);
  }

  async getAll(
    page: string = '1',
    limit: string = '10',
    searchTerm: string = '',
    filter: { area: string; region: string } = { area: '', region: '' },
  ) { 
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    return this.AbsensiRepository.getAll(pageInt, limitInt, searchTerm, filter);
  }

}
