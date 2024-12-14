import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AbsensiRepository } from '../repository/absensi.repository';
import { CreateDto, UpdateDto } from '../dtos/absensi.dtos';
import { UserRepo } from '../../user/repository/user.repo';

@Injectable()
export class AbsensiService {
  constructor(
    private readonly AbsensiRepository: AbsensiRepository,
    private readonly userRepository: UserRepo,
  ) {}

  async create(CreateDto: CreateDto) {
    const user = await this.userRepository.findByIdDecrypted(CreateDto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const absensiToday = await this.AbsensiRepository.findByUserId(user.id);
    if (absensiToday) {
      if (absensiToday.clockIn) {
        throw new BadRequestException('Already has clock in today');
      }
    }

    const timeClockIn = new Date(CreateDto.clockIn);
    if (timeClockIn.getHours() >= 8) {
      const diffMs = timeClockIn.getTime() - new Date().setHours(8, 0, 0, 0);
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      CreateDto.status = `Terlambat ${diffHrs} jam ${diffMins} menit`;
    } else {
      CreateDto.status = 'On Time';
    }

    const result = await this.AbsensiRepository.createData(CreateDto);
    return result;
  }

  async update(UpdateDto: UpdateDto) {
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

    const timeClockOut = new Date(UpdateDto.clockOut);
    if (timeClockOut.getHours() < 17) {
      throw new BadRequestException('Clock out time must be greater than 17:00');
    }

    UpdateDto.clockOut = timeClockOut;

    return this.AbsensiRepository.updateData(absensiToday.id, UpdateDto);
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
