import { Injectable } from '@nestjs/common';
import { CreateCallPlanDto, UpdateCallPlanDto } from '../dtos/callplan.dtos';
import { CallPlanRepository } from '../repository/callplan.repository';
import { CallPlanScheduleRepository } from '../repository/callplanschedule.repository';
import { generateCode } from '../../../helpers/nojorono.helpers';
import { logger } from 'nestjs-i18n';
import { CreateCallPlanScheduleDto, UpdateCallPlanScheduleDto } from '../dtos/callplanschedule.dtos';
import { UserRepo } from '../../user/repository/user.repo';

@Injectable()
export class CallPlanService {
  constructor(
    private readonly callPlanRepository: CallPlanRepository,
    private readonly callPlanScheduleRepository: CallPlanScheduleRepository,
    private readonly userRepository: UserRepo,
  ) {}
  async updateCallPlanSchedule(
    id: number,
    updateCallPlanScheduleDto: UpdateCallPlanScheduleDto,
    accessToken,
  ) {
    try {
      const userCreate = await this.userRepository.findByToken(accessToken);
      updateCallPlanScheduleDto.updated_by = userCreate.email;
      return this.callPlanScheduleRepository.updateData(
        id,
        updateCallPlanScheduleDto,
      );
    } catch (e) {
      logger.error(e);
      return e;
    }
  }
  async createCallPlanSchedule(
    createCallPlaScheduleDto: CreateCallPlanScheduleDto,
    accessToken,
  ) {
    try {
      const userCreate = await this.userRepository.findByToken(accessToken);
      createCallPlaScheduleDto.created_by = userCreate.email;
      return this.callPlanScheduleRepository.createData(
        createCallPlaScheduleDto,
      );
    } catch (e) {
      logger.error(e);
      return e;
    }
  }

  async deleteCallPlanSchedule(id: number, accessToken) {
    const userCreate = await this.userRepository.findByToken(accessToken);
    return this.callPlanScheduleRepository.deleteById(id, userCreate.email);
  }

  async createCallPlan(createCallPlanDto: CreateCallPlanDto) {
    try {
      const lastId = await this.callPlanRepository.findLastId();
      createCallPlanDto.code_call_plan = generateCode('CL', lastId.id + 1);
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

  async getAll(page: number = 1, limit: number = 10, searchTerm: string = '') {
    return this.callPlanRepository.getAllCallPlan(page, limit, searchTerm);
  }

  async getSchedules(id: string) {
    return this.callPlanScheduleRepository.getByIdCallPlan(id);
  }
}
