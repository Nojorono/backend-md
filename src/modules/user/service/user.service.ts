// src/user/user.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from '../dtos/user.dtos';
import { UserRepo } from '../repository/user.repo';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepo) {}

  // Create a new user
  async store(createUserDto: CreateUserDto) {
    try {
      return await this.userRepo.createUser(createUserDto);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async getAllWithPaginate(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    return this.userRepo.getAllPagination(page, limit, searchTerm);
  }
}
