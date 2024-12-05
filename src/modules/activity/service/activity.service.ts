import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserRepo } from '../../user/repository/user.repo';
import {
  CreateMdActivityDto,
  UpdateMdActivityDto,
} from '../dtos/activitymd.dtos';
import { ActivityRepository } from '../repository/activity.repository';
import { logger } from 'nestjs-i18n';
import { ActivitySioRepository } from '../repository/activity_sio.repository';
import { ActivitySogRepository } from '../repository/activity_sog.repository';
import { S3Service } from 'src/modules/s3/service/s3.service';

@Injectable()
export class ActivityService {
  constructor(
    private readonly repository: ActivityRepository,
    private readonly activitySioRepository: ActivitySioRepository,
    private readonly activitySogRepository: ActivitySogRepository,
    private readonly userRepository: UserRepo,
    private readonly s3Service: S3Service,
  ) {}

  async createData(createDto: CreateMdActivityDto) {
    try {

      const user = await this.userRepository.findById(createDto.user_id);
      createDto.created_by = user.email;
      createDto.created_at = new Date();
      createDto.start_time = new Date(createDto.start_time);
      createDto.end_time = new Date(createDto.end_time);

      if (createDto.photos && createDto.photos.length > 0) {
        for (let i = 0; i < createDto.photos.length; i++) {
          createDto.photos[i] = await this.s3Service.uploadImageFromUri(createDto.photos[i], 'activity');
        }
      }
      const data = await this.repository.create(createDto);
      // Handle multiple entries for activity_sio
      if (createDto.activity_sio && Array.isArray(createDto.activity_sio)) {
          const sioEntries = await Promise.all(createDto.activity_sio.map(async sio => ({
            ...sio,
            activity_id: data[0].id,
            photo: sio.photo ? await this.s3Service.uploadImageFromUri(sio.photo, 'activity_sio') : null,
          })));
          await this.activitySioRepository.create(sioEntries);
      }

      // Handle multiple entries for activity_sog
      if (createDto.activity_sog && Array.isArray(createDto.activity_sog)) {
          const sogEntries = await Promise.all(createDto.activity_sog.map(async sog => ({
            ...sog,
            activity_id: data[0].id,
          })));
          await this.activitySogRepository.create(sogEntries);
      }

      return data;
    } catch (e) {
      logger.error('Error in create activity:', e.message, e.stack);
      if (e instanceof HttpException) {
        throw e;
      }
      throw new InternalServerErrorException('Failed to create activity');
    }
  }

  async getDataById(id: number) {
    return this.repository.getById(id);
  }

  async getRegionAndArea(id: number) {
    return this.repository.getRegionAndArea(id);
  }

  async updateData(id: number, updateDto: UpdateMdActivityDto) {
    return this.repository.update(id, updateDto);
  }

  async deleteData(id: number, accessToken: string): Promise<void> {
    const user = await this.userRepository.findByToken(accessToken);
    return this.repository.delete(id, user.email);
  }

  async getAllActive(
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    return this.repository.getAllActive(page, limit, searchTerm);
  }
}
