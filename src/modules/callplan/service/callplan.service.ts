import { Injectable } from '@nestjs/common';
import { CreateCallPlanDto, UpdateCallPlanDto } from '../dtos/callplan.dtos';
import { CallPlanRepository } from '../repository/callplan.repository';

@Injectable()
export class CallPlanService {
  constructor(private readonly callPlanRepository: CallPlanRepository) {}

  async createCallPlan(createCallPlanDto: CreateCallPlanDto) {
    return this.callPlanRepository.createData(createCallPlanDto);
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

  async getAll(page: number = 1, limit: number = 10, searchTerm: string = '') {
    return this.callPlanRepository.getAllCallPlan(page, limit, searchTerm);
  }
}
