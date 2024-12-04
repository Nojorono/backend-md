import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../repository/comments.repository';
import { CreateDto, UpdateDto } from '../dtos/comments.dtos';
import { UserRepo } from '../../user/repository/user.repo';

@Injectable()
export class CommentsService {
  constructor(
    private readonly CommentsRepository: CommentsRepository,
    private readonly userRepository: UserRepo,
  ) {}

  async create(CreateDto: CreateDto, accessToken) {
    const user = await this.userRepository.findByToken(accessToken);
    return this.CommentsRepository.createData(CreateDto);
  }

  async getById(id: string) {
    return this.CommentsRepository.getById(id);
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
