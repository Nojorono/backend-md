import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { AbsensiRepository } from '../repository/absensi.repository';
import { CreateDto, UpdateDto } from '../dtos/absensi.dtos';
import { UserRepo } from '../../user/repository/user.repo';
import { S3Service } from 'src/modules/s3/service/s3.service';
import { logger } from 'nestjs-i18n';

@Injectable()
export class AbsensiService {
  constructor(
    private readonly AbsensiRepository: AbsensiRepository,
    private readonly userRepository: UserRepo,
    private readonly s3Service: S3Service,
  ) {}

  async findToday(userId: string) {
    const user = await this.userRepository.findByIdDecrypted(userId);
    const absensiToday = await this.AbsensiRepository.findByUserId(user.id);
    return absensiToday;
  }

  async create(CreateDto: any, file: Express.Multer.File) {
    try {
      const user = await this.userRepository.findByIdDecrypted(CreateDto.userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const absensiToday = await this.AbsensiRepository.findByUserId(user.id);
      if (absensiToday) {
        if (absensiToday.clockIn) {
          throw new HttpException('Already has clock in today', HttpStatus.BAD_REQUEST);
        }
      }

      // Ensure clockIn is a valid Date object and convert to Jakarta timezone
      const timeClockIn = CreateDto.clockIn instanceof Date ? 
        new Date(CreateDto.clockIn.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })) :
        new Date(new Date(CreateDto.clockIn).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));

      // Get Jakarta time reference for 8 AM
      const jakartaRef = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      jakartaRef.setHours(8, 0, 0, 0);

      if (timeClockIn.getHours() >= 8) {
        const diffMs = timeClockIn.getTime() - jakartaRef.getTime();
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        CreateDto.status = `Terlambat ${diffHrs} jam ${diffMins} menit`;
      } else {
        CreateDto.status = 'On Time';
      }

      if (file) {
        const photoIn = await this.s3Service.uploadImageFlexible(file, 'absensi');
        CreateDto.photoIn = photoIn;
      }

      CreateDto.clockIn = timeClockIn;
      CreateDto.date = new Date(CreateDto.date);
      CreateDto.area = user.area[0];
      CreateDto.region = user.region;

      const result = await this.AbsensiRepository.createData(CreateDto, user.id);
      return result;
    } catch (error) {
      logger.error('Failed to create:', error.message, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to create attendance record: ' + error.message);
    }
  }

  async update(UpdateDto: any, file: Express.Multer.File) {
    try {
      const user = await this.userRepository.findByIdDecrypted(UpdateDto.userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const absensiToday = await this.AbsensiRepository.findByUserId(user.id);
      if (!absensiToday) {
        throw new NotFoundException('Absensi not found');
      }

      if (absensiToday.clockOut) {
        throw new BadRequestException('Already has clock out today');
      }

      const timeClockOut = UpdateDto.clockOut instanceof Date ?
        UpdateDto.clockOut :
        new Date(UpdateDto.clockOut);
      
      // Convert to Asia/Jakarta timezone
      const jakartaTime = new Date(timeClockOut.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      const jakartaHours = jakartaTime.getHours();

      if (jakartaHours < 16) {
        throw new BadRequestException('Clock out time must be greater than 17:00');
      }

      UpdateDto.clockOut = timeClockOut;
      UpdateDto.userId = user.id;

      if (file) {
        const photoOut = await this.s3Service.uploadImageFlexible(file, 'absensi');
        UpdateDto.photoOut = photoOut;
      }

      await this.AbsensiRepository.updateData(absensiToday.id, UpdateDto);
      const data = await this.AbsensiRepository.findByUserId(user.id);
      return data;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update attendance record: ' + error.message);
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
    return this.AbsensiRepository.getAll(pageInt, limitInt, searchTerm, filter);
  }

}
