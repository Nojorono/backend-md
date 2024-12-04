import { Injectable } from '@nestjs/common';
import { SurveyRepository } from '../repository/survey.repository';
import { CreateDto, UpdateDto } from '../dtos/survey.dtos';
import { UserRepo } from '../../user/repository/user.repo';

@Injectable()
export class SurveyService {
  constructor(
    private readonly SurveyRepository: SurveyRepository,
    private readonly userRepository: UserRepo,
  ) {}

  async create(CreateDto: CreateDto, accessToken) {
    const user = await this.userRepository.findByToken(accessToken);
    CreateDto.created_by = user.email;
    CreateDto.created_at = new Date();
    return this.SurveyRepository.createData(CreateDto);
  }

  async getById(id: string) {
    return this.SurveyRepository.getById(id);
  }

  async update(id: number, UpdateDto: UpdateDto, accessToken) {
    const user = await this.userRepository.findByToken(accessToken);
    UpdateDto.updated_by = user.email;
    UpdateDto.updated_at = new Date();
    return this.SurveyRepository.updateData(id, UpdateDto);
  }

  async delete(id: number, accessToken: string) {
    const user = await this.userRepository.findByToken(accessToken);
    return this.SurveyRepository.deleteById(id, user.email);
  }

  async getAll(
    accessToken: string,
    page: string = '1',
    limit: string = '10',
    searchTerm: string = '',
  ) {
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    const user = await this.userRepository.findByToken(accessToken);
    // Extract area and region from the user object to pass as filters
    const filter = {
      area: user.area || '',
      region: user.region || '',
    };
    return this.SurveyRepository.getAll(pageInt, limitInt, searchTerm, filter);
  }

  async getSchedule(accessToken: string) {
    const user = await this.userRepository.findByToken(accessToken);
    const filter = {
      area: user.area || [],
      region: user.region || '',
    };
    return this.SurveyRepository.getSchedule(filter);  
  }
}
