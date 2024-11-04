// src/user/user.service.ts
import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dtos';
import { UserRepo } from '../repository/user.repo';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepo) {}

  // Create a new user
  async store(createUserDto: CreateUserDto, accessToken: string) {
    try {
      // Find the user associated with the provided token
      const user = await this.userRepo.findByToken(accessToken);
      if (!user) {
        // Throw an unauthorized error if the token is invalid or user is not found
        throw new HttpException(
          'Invalid access token',
          HttpStatus.UNAUTHORIZED,
        );
      }
      // Check if user with the provided email already exists
      const findExist = await this.userRepo.getUserByEmail(createUserDto.email);
      if (findExist) {
        // Throw a conflict error if the email is already taken
        throw new HttpException('Email is already taken', HttpStatus.CONFLICT);
      }
      // Create and return the new user
      return await this.userRepo.createUser(createUserDto, user.email);
    } catch (e) {
      // Throw an internal server error with the original error message
      throw new InternalServerErrorException(e.message);
    }
  }

  // Update a new user
  async update(id: string, updateUserDto: UpdateUserDto, accessToken: string) {
    try {
      const user = await this.userRepo.findByToken(accessToken);
      if (!user) {
        throw new HttpException(
          'Invalid access token',
          HttpStatus.UNAUTHORIZED,
        );
      }
      return await this.userRepo.updateUser(id, {
        username: updateUserDto.username,
        user_role_id: updateUserDto.user_role_id,
        fullname: updateUserDto.fullname,
        email: updateUserDto.email,
        phone: updateUserDto.phone,
        area: updateUserDto.area,
        region: updateUserDto.region,
        type_md: updateUserDto.type_md,
        valid_from: new Date(updateUserDto.valid_from),
        valid_to: new Date(updateUserDto.valid_to),
        updated_at: new Date(),
        updated_by: user.email,
      });
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async getAllWithPaginate(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
    accessToken,
  ) {
    const user = await this.userRepo.findByToken(accessToken);
    return this.userRepo.getAllPagination(page, limit, searchTerm, user);
  }
}
