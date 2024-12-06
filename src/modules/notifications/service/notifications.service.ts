import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from '../repository/notifications.repository';
import { CreateDto, UpdateDto } from '../dtos/notifications.dtos';
import { UserRepo } from '../../user/repository/user.repo';
import { AppGateway } from 'src/socket/socket.gateaway';


@Injectable()
export class NotificationsService {
  constructor(
    private readonly NotificationsRepository: NotificationsRepository,
    private readonly userRepository: UserRepo,
    private readonly appGateway: AppGateway,  
  ) {}

  // Create notification type 1 = comment
  async create(CreateDto: CreateDto, user?: any, region?: string, area?: string) {
    if (CreateDto.type == 1) {
        const findIdUserRegionArea = await this.userRepository.findIdUserRegionArea(user, region, area);
        for (const user of findIdUserRegionArea) {
            CreateDto.user_id = user.id;
            CreateDto.message = CreateDto.message;
            CreateDto.is_read = false;
            CreateDto.created_at = new Date();
            await this.NotificationsRepository.createData(CreateDto);
            this.appGateway.notifyComment(user.id, {
              message: CreateDto.message,
              notification_identifier: CreateDto.notification_identifier,
            });
        }
    }
  }

  async getById(id: string) {
    return this.NotificationsRepository.getById(id);
  }

  // async getByUserId(userId: number) {
  //   return this.NotificationsRepository.getByUserId(userId);
  // }

  async update(id: number, UpdateDto: UpdateDto, accessToken) {
    const user = await this.userRepository.findByToken(accessToken);
    return this.NotificationsRepository.updateData(id, UpdateDto);
  }

  async delete(id: number, accessToken: string) {
    const user = await this.userRepository.findByToken(accessToken);
    return this.NotificationsRepository.deleteById(id, user.email);
  }

  async getAll(
   userId: string,
   limit: string,
   offset: string
  ) {
    return this.NotificationsRepository.getAll(userId, parseInt(limit), parseInt(offset));
  }


}
