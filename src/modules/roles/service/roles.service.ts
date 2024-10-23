import { Injectable } from '@nestjs/common';
import { RolesRepository } from '../repository/roles.repository';
import { CreateRolesDto, UpdateRolesDto } from '../dtos/roles.dtos';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async createRoles(createRolesDto: CreateRolesDto) {
    return this.rolesRepository.createRoles(createRolesDto);
  }

  async getRolesById(id: number) {
    return this.rolesRepository.getRolesById(id);
  }

  async updateRoles(id: number, updateRolesDto: UpdateRolesDto) {
    return this.rolesRepository.updateRoles(id, updateRolesDto);
  }

  async deleteRoles(id: number) {
    return this.rolesRepository.deleteRoles(id);
  }

  async getAllActiveRoles(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    return this.rolesRepository.getAllActiveRoles(page, limit, searchTerm);
  }
}
