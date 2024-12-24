import { Injectable } from '@nestjs/common';
import { RolesRepository } from '../repository/roles.repository';
import { UserRepo } from '../../user/repository/user.repo';
import { CreateRolesDto, UpdateRolesDto } from '../dtos/roles.dtos';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class RolesService {
  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepo,
  ) {}

  async createRoles(createRolesDto: CreateRolesDto) {
    return this.rolesRepository.createRoles(createRolesDto);
  }

  async getRolesById(id: number) {
    return this.rolesRepository.getRolesById(id);
  }

  async updateRoles(id: string, updateRolesDto: UpdateRolesDto) {
    return this.rolesRepository.updateRoles(id, updateRolesDto);
  }

  async deleteRoles(id: string, accessToken: string): Promise<void> {
    const decoded = this.jwtService.verify(accessToken);
    return this.rolesRepository.deleteRoles(id, decoded.email);
  }
  async getAllRolesList(accessToken) {
    const decoded = this.jwtService.verify(accessToken);
    const user = await this.userRepo.findByIdDecrypted(decoded.id);
    return this.rolesRepository.getRolesList(user.Roles);
  }
  async getAllActiveRoles(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    return this.rolesRepository.getAllActiveRoles(page, limit, searchTerm);
  }
}
