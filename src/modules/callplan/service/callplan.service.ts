import { Injectable } from '@nestjs/common';
import { CreateCallPlanDto, UpdateCallPlanDto } from '../dtos/callplan.dtos';
import { CallPlanRepository } from '../repository/callplan.repository';
import { logger } from 'nestjs-i18n';
import { UserRepo } from '../../user/repository/user.repo';

@Injectable()
export class CallPlanService {
  constructor(
    private readonly callPlanRepository: CallPlanRepository,
    private readonly userRepository: UserRepo,
  ) {}

  async createCallPlan(createCallPlanDto: CreateCallPlanDto) {
    try {
      return this.callPlanRepository.createData(createCallPlanDto);
    } catch (e) {
      logger.error(e);
      return e;
    }
  }

  async getCallPlanById(id: string) {
    return this.callPlanRepository.getById(id);
  }

  async updateCallPlan(id: string, updateCallPlanDto: UpdateCallPlanDto) {
    return this.callPlanRepository.updateData(id, updateCallPlanDto);
  }

  async deleteCallPlan(id: string) {
    return this.callPlanRepository.deleteById(id);
  }

  async getAll(
    accessToken,
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    const user = await this.userRepository.findByToken(accessToken);
    // Extract area and region from the user object to pass as filters
    const filter = {
      area: user.area || [],
      region: user.region || '',
    };
    return this.callPlanRepository.getAllCallPlan(
      page,
      limit,
      searchTerm,
      filter,
    );
  }
}
