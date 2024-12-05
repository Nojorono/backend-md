import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../repository/comments.repository';
import { CreateDto, UpdateDto } from '../dtos/comments.dtos';
import { UserRepo } from '../../user/repository/user.repo';
import { v4 as uuidv4 } from 'uuid';
import { NotificationsService } from '../../notifications/service/notifications.service';
import { ActivityRepository } from '../../activity/repository/activity.repository';

@Injectable()
export class CommentsService {
  constructor(
    private readonly CommentsRepository: CommentsRepository,
    private readonly userRepository: UserRepo,
    private readonly NotificationsService: NotificationsService,
    private readonly ActivityRepository: ActivityRepository,
  ) {}

  async create(CreateDto: CreateDto) {
    const user = await this.userRepository.getUserById(CreateDto.user_id);
    CreateDto.user_id = user.id;
    CreateDto.created_at = new Date();
    CreateDto.notification_identifier = uuidv4();

    const result = await this.CommentsRepository.createData(CreateDto);
    const findActivity = await this.ActivityRepository.getRegionAndArea(CreateDto.activity_id);
    this.NotificationsService.create({
      type: 1,
      notification_identifier: result[0].notification_identifier,
      message: CreateDto.content,
    }, user, findActivity.region, findActivity.area);

    return result;
  }

  async getById(id: string) {
    return this.CommentsRepository.getById(id);
  }

  async getByActivityId(id: number) {
    return this.CommentsRepository.getByActivityId(id);
  }

  async update(id: number, UpdateDto: UpdateDto, accessToken) {
    const user = await this.userRepository.findByToken(accessToken);
    return this.CommentsRepository.updateData(id, UpdateDto);
  }

  async delete(id: number, accessToken: string) {
    const user = await this.userRepository.findByToken(accessToken);
    return this.CommentsRepository.deleteById(id, user.email);
  }

  async getAll(
   activityId: number
  ) {
    return this.CommentsRepository.getAll(activityId);
  }


}
