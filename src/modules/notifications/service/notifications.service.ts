import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from '../repository/notifications.repository';
import { CreateDto, UpdateDto } from '../dtos/notifications.dtos';
import { UserRepo } from '../../user/repository/user.repo';
import { AppGateway } from 'src/socket/socket.gateaway';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly NotificationsRepository: NotificationsRepository,
    private readonly userRepository: UserRepo,
    private readonly appGateway: AppGateway,
    private readonly jwtService: JwtService,
  ) {}

  async create(
    CreateDto: CreateDto,
    userData?: any,
    region?: string,
    area?: string,
  ) {
    const findIdUserRegionArea = await this.userRepository.findIdUserRegionArea(
      userData.email,
      region,
      area,
    );
    if (findIdUserRegionArea.length === 0) {
      return;
    }
    for (const user of findIdUserRegionArea) {
      CreateDto.user_id = user.id;
      CreateDto.message = CreateDto.message;
      CreateDto.is_read = false;
      CreateDto.created_at = new Date();
      await this.NotificationsRepository.createData(CreateDto);
      this.appGateway.notifyBroadcast(user.id, {
        message: CreateDto.message,
        notification_identifier: CreateDto.notification_identifier,
      });
    }
  }

  async getById(id: string) {
    return this.NotificationsRepository.getById(id);
  }

  async update(id: number, UpdateDto: UpdateDto, accessToken) {
    const decoded = this.jwtService.verify(accessToken);
    return this.NotificationsRepository.updateData(id, UpdateDto);
  }

  async delete(id: number, accessToken: string) {
    const decoded = this.jwtService.verify(accessToken);
    return this.NotificationsRepository.deleteById(id, decoded.email);
  }

  async getAll(userId: string, limit: string, offset: string) {
    return this.NotificationsRepository.getAll(
      userId,
      parseInt(limit),
      parseInt(offset),
    );
  }
}
