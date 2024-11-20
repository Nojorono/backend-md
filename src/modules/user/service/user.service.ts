// src/user/user.service.ts
import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dtos';
import { UserRepo } from '../repository/user.repo';
import { logger } from 'nestjs-i18n';
import { S3Service } from '../../s3/service/s3.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly s3Service: S3Service,
  ) {}

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
      if (createUserDto.email) {
        createUserDto.email.toLowerCase();
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
  async update(
    accessToken: string,
    id: string,
    updateUserDto: UpdateUserDto,
    photo: Express.Multer.File,
  ) {
    try {
      const user = await this.userRepo.findByToken(accessToken);
      if (!user) {
        throw new HttpException(
          'accessTokenUnauthorized',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const dataUser = await this.userRepo.getUserById(id);
      if (updateUserDto.email) {
        updateUserDto.email.toLowerCase();
      }
      if (dataUser.email !== updateUserDto.email) {
        const findExist = await this.userRepo.getUserByEmail(
          updateUserDto.email,
        );
        if (findExist) {
          // Throw a conflict error if the email is already taken
          throw new HttpException('userExists', HttpStatus.CONFLICT);
        }
      }
      updateUserDto.updated_by = user.email;
      updateUserDto.updated_at = new Date();
      if (photo) {
        updateUserDto.photo = await this.s3Service.uploadCompressedImage(
          'profile',
          photo,
        );
        return await this.userRepo.updateUserReturn(id, updateUserDto);
      } else {
        return await this.userRepo.updateUser(id, updateUserDto);
      }
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
