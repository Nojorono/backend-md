import { Injectable } from '@nestjs/common';
import { SurveyRepository } from '../repository/survey.repository';
import { CreateDto, UpdateDto } from '../dtos/survey.dtos';
import { UserRepo } from '../../user/repository/user.repo';
import { OutletRepository } from 'src/modules/outlet/repository/outlet.repository';
import { CallPlanRepository } from 'src/modules/callplan/repository/callplan.repository';

@Injectable()
export class SurveyService {
  constructor(
    private readonly SurveyRepository: SurveyRepository,
    private readonly userRepository: UserRepo,
    private readonly outletRepository: OutletRepository,  
    private readonly callPlanRepository: CallPlanRepository,
  ) {}

  async create(CreateDto: CreateDto, accessToken) {
    const user = await this.userRepository.findByToken(accessToken);
    CreateDto.created_by = user.email;
    CreateDto.created_at = new Date();
    const result = await this.SurveyRepository.createData(CreateDto);
    await this.outletRepository.updateOutlet(CreateDto.outlet_id, {
      survey_outlet_id: result[0].id,
    });
    return result;
  }

  async getById(id: number) {
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
    isActive: string = '',
    filter: { area: string; region: string } = { area: '', region: '' },
  ) { 
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    return this.SurveyRepository.getAll(pageInt, limitInt, searchTerm, isActive, filter);
  }

  async getSchedule(callPlanId: string) {
    const callPlan = await this.callPlanRepository.getById(callPlanId);
    return this.SurveyRepository.getSchedule(callPlan.area, callPlan.region);  
  }
}
