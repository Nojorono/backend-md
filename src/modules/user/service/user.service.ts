// src/user/user.service.ts
import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dtos';
import { UserRepo } from '../repository/user.repo';
import { logger } from 'nestjs-i18n';

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
          'accessTokenUnauthorized',
          HttpStatus.UNAUTHORIZED,
        );
      }
      // Check if user with the provided email already exists
      const findExist = await this.userRepo.getUserByEmail(createUserDto.email);
      if (findExist) {
        // Throw a conflict error if the email is already taken
        throw new HttpException('userExists', HttpStatus.CONFLICT);
      }
      // Create and return the new user
      return await this.userRepo.createUser(createUserDto, user.email);
    } catch (e) {
      // Log the error and its stack trace for more insight
      logger.error('Error in create user:', e.message, e.stack);
      if (e instanceof HttpException) {
        throw e;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  // Update a new user
  async update(id: string, updateUserDto: UpdateUserDto, accessToken: string) {
    try {
      const user = await this.userRepo.findByToken(accessToken);
      if (!user) {
        throw new HttpException(
          'accessTokenUnauthorized',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const dataUser = await this.userRepo.getUserById(id);
      if (dataUser.email !== updateUserDto.email) {
        const findExist = await this.userRepo.getUserByEmail(
          updateUserDto.email,
        );
        if (findExist) {
          // Throw a conflict error if the email is already taken
          throw new HttpException('userExists', HttpStatus.CONFLICT);
        }
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
      // Log the error and its stack trace for more insight
      logger.error('Error in create user:', e.message, e.stack);
      if (e instanceof HttpException) {
        throw e;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async getAllWithPaginate(
    page: string = '1',
    limit: string = '10',
    searchTerm: string = '',
    accessToken,
  ) {
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    const user = await this.userRepo.findByToken(accessToken);
    return this.userRepo.getAllPagination(pageInt, limitInt, searchTerm, user);
  }
}
