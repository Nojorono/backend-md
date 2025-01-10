import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateDto, UpdateDto } from '../dtos/reimburseBbm.dtos';
import { UserRepo } from '../../user/repository/user.repo';
import { S3Service } from 'src/modules/s3/service/s3.service';
import { logger } from 'nestjs-i18n';
import { ReimburseBbmRepository } from '../repository/reimburseBbm.repository';
@Injectable()
export class ReimburseBbmService {
  constructor(
    private readonly ReimburseBbmRepository: ReimburseBbmRepository,
    private readonly userRepository: UserRepo,
    private readonly s3Service: S3Service,
  ) {}

  async findToday(userId: string) {
    const user = await this.userRepository.findByIdDecrypted(userId);
    const findByUserId = await this.ReimburseBbmRepository.findByUserId(
      user.id,
    );
    return findByUserId;
  }

  async create(CreateDto: CreateDto, photo_in: Express.Multer.File) {
    try {
      const user = await this.userRepository.findByIdDecrypted(
        CreateDto.user_id,
      );

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const dateIn =
        CreateDto.date_in instanceof Date
          ? CreateDto.date_in
          : new Date(CreateDto.date_in);

      if (photo_in) {
        const photoIn = await this.s3Service.uploadImageFlexible(
          photo_in,
          'reimburse-bbm',
        );
        CreateDto.photo_in = photoIn;
      }

      if (CreateDto.kilometer_in < 0) {
        throw new BadRequestException('Kilometer in cannot be less than 0');
      }

      CreateDto.date_in = dateIn;

      const result = await this.ReimburseBbmRepository.createData(
        CreateDto,
        user.id,
      );
      return result;
    } catch (error) {
      logger.error('Failed to create:', error.message, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to create attendance record: ' + error.message,
      );
    }
  }

  async update(UpdateDto: UpdateDto, photo_out: Express.Multer.File) {
    try {
      const findById = await this.ReimburseBbmRepository.findById(UpdateDto.id);
      if (!findById) {
        throw new NotFoundException('Reimburse BBM not found');
      }

      const dateOut =
        UpdateDto.date_out instanceof Date
          ? UpdateDto.date_out
          : new Date(UpdateDto.date_out);

      UpdateDto.date_out = dateOut;

      if (photo_out) {
        const photoOut = await this.s3Service.uploadImageFlexible(
          photo_out,
          'reimburse-bbm',
        );
        UpdateDto.photo_out = photoOut;
      }

      if (UpdateDto.kilometer_out < 0) {
        throw new BadRequestException('Kilometer out cannot be less than 0');
      }

      if (UpdateDto.kilometer_out < findById.kilometer_in) {
        throw new BadRequestException('Kilometer out cannot be less than kilometer in');
      }

      await this.ReimburseBbmRepository.updateData(UpdateDto.id, UpdateDto);
      return UpdateDto;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to update attendance record: ' + error.message,
      );
    }
  }

  async getAll(
    page: string = '1',
    limit: string = '10',
    searchTerm: string = '',
    filter: { area: string; region: string } = { area: '', region: '' },
  ) {
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    return this.ReimburseBbmRepository.getAll(
      pageInt,
      limitInt,
      searchTerm,
      filter,
    );
  }
}
