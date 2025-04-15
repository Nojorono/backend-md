// src/user/user.service.ts
import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dtos';
import { UserRepo } from '../repository/user.repo';
import { logger } from 'nestjs-i18n';
import { S3Service } from '../../s3/service/s3.service';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly s3Service: S3Service,
    private readonly jwtService: JwtService,
  ) {}

  // Create a new user
  async store(createUserDto: CreateUserDto, accessToken: string) {
    try {
      const decoded = this.jwtService.verify(accessToken);
      if (createUserDto.email) {
        createUserDto.email = createUserDto.email.toLowerCase();
      }
      // Validate input lengths
      if (createUserDto.username && createUserDto.username.length > 50) {
        throw new HttpException('Username must be 50 characters or less.', HttpStatus.BAD_REQUEST);
      }
      if (createUserDto.fullname && createUserDto.fullname.length > 50) {
        throw new HttpException('Fullname must be 50 characters or less.', HttpStatus.BAD_REQUEST);
      }
      if (createUserDto.email && createUserDto.email.length > 100) {
        throw new HttpException('Email must be 100 characters or less.', HttpStatus.BAD_REQUEST);
      }      
      // Check if user with the provided email already exists
      const findExist = await this.userRepo.getUserByEmail(createUserDto.email);
      console.log(findExist)
      if (findExist) {
        // Throw a conflict error if the email is already taken
        throw new HttpException('userExists', HttpStatus.CONFLICT);
      }

      // Create and return the new user
      return await this.userRepo.createUser(createUserDto, decoded.email);
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
      const decoded = this.jwtService.verify(accessToken);
      if (!decoded) {
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
      updateUserDto.updated_by = decoded.email;
      updateUserDto.updated_at = new Date();
      if (photo) {
        updateUserDto.photo = await this.s3Service.uploadCompressedImage(
          'profile',
          photo,
        );
        return await this.userRepo.updateUserReturn(id, updateUserDto);
      } else {
        updateUserDto.valid_to = new Date(updateUserDto.valid_to);
        updateUserDto.valid_from = new Date(updateUserDto.valid_from);
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
    accessToken: string,
    page: string = '1',
    limit: string = '10',
    searchTerm: string = '',
    filter: { area: string; region: string },
  ) {
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    const decoded = this.jwtService.verify(accessToken);
    const user = await this.userRepo.findByIdDecrypted(decoded.id);
    return this.userRepo.getAllPagination(pageInt, limitInt, searchTerm, filter, user);
  }
}
