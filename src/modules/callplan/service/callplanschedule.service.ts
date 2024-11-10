import { Injectable } from '@nestjs/common';
import { CallPlanScheduleRepository } from '../repository/callplanschedule.repository';
import { generateCode } from '../../../helpers/nojorono.helpers';
import { logger } from 'nestjs-i18n';
import {
  CreateCallPlanScheduleDto,
  UpdateCallPlanScheduleDto,
} from '../dtos/callplanschedule.dtos';
import { UserRepo } from '../../user/repository/user.repo';

@Injectable()
export class CallPlanScheduleService {
  constructor(
    private readonly callPlanScheduleRepository: CallPlanScheduleRepository,
    private readonly userRepository: UserRepo,
  ) {}

  async updateCallPlanSchedule(
    id: string,
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

      const lastId = await this.callPlanScheduleRepository.findLastId();
      let currentId = lastId ? lastId.id + 1 : 1;

      const results = [];
      for (const outletId of createCallPlaScheduleDto.outlet_id) {
        const code_call_plan = generateCode('CL', currentId++);

        // Clone the DTO and set the outlet-specific properties
        const newScheduleDto = {
          ...createCallPlaScheduleDto,
          outlet_id: outletId,
          code_call_plan,
        };

        // Create data for each outlet
        const result =
          await this.callPlanScheduleRepository.createData(newScheduleDto);
        results.push(result);
      }

      return results;
    } catch (e) {
      logger.error(e);
      return e;
    }
  }

  async deleteCallPlanSchedule(id: string, accessToken) {
    const userCreate = await this.userRepository.findByToken(accessToken);
    return this.callPlanScheduleRepository.deleteById(id, userCreate.email);
  }

  async getSchedules(
    id: string,
    page: string = '1',
    limit: string = '10',
    searchTerm: string = '',
  ) {
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    return this.callPlanScheduleRepository.getByIdCallPlan(
      id,
      pageInt,
      limitInt,
      searchTerm,
    );
  }

  async getByIdUser(id: string) {
    return this.callPlanScheduleRepository.getByIdUser(id);
  }
}
