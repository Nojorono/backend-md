import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../repository/comments.repository';
import { CreateDto, UpdateDto } from '../dtos/comments.dtos';
import { UserRepo } from '../../user/repository/user.repo';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class CommentsService {
  constructor(
    private readonly CommentsRepository: CommentsRepository,
    private readonly userRepository: UserRepo,
  ) {}

  async create(CreateDto: CreateDto, accessToken) {
    const user = await this.userRepository.findByToken(accessToken);
    CreateDto.user_id = user.id;
    CreateDto.created_at = new Date();
    CreateDto.notification_identifier = uuidv4();

    return this.CommentsRepository.createData(CreateDto);
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
