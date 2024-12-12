import { Injectable } from '@nestjs/common';
import { UserRepo } from '../../user/repository/user.repo';
import { CreateProgramDto, UpdateProgramDto } from '../dtos/program.dtos';
import { ProgramRepository } from '../repository/program.repository';

@Injectable()
export class ProgramService {
  constructor(
    private readonly programRepository: ProgramRepository,
    private readonly userRepository: UserRepo,
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
    const user = await this.userRepository.findByToken(accessToken);
    return this.programRepository.delete(id, user.email);
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
