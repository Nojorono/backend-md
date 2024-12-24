import { Injectable } from '@nestjs/common';
import { CreateProgramDto, UpdateProgramDto } from '../dtos/program.dtos';
import { ProgramRepository } from '../repository/program.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ProgramService {
  constructor(
    private readonly programRepository: ProgramRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createData(createProgramDto: CreateProgramDto) {
    return this.programRepository.create(createProgramDto);
  }

  async getDataById(id: number) {
    return this.programRepository.getById(id);
  }

  async updateData(id: number, updateProgramDto: UpdateProgramDto) {
    return this.programRepository.update(id, updateProgramDto);
  }

  async deleteData(id: number, accessToken: string): Promise<void> {
    const decoded = this.jwtService.verify(accessToken);
    return this.programRepository.delete(id, decoded.email);
  }

  async getAllActive(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    return this.programRepository.getAllActive(page, limit, searchTerm);
  }

  async getAll() {
    return this.programRepository.getAll();
  }
}
