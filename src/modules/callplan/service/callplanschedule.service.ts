import { Injectable, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { CallPlanScheduleRepository } from '../repository/callplanschedule.repository';
import { generateCode } from '../../../helpers/nojorono.helpers';
import { logger } from 'nestjs-i18n';
import {
  CreateCallPlanScheduleDto,
  UpdateCallPlanScheduleDto,
} from '../dtos/callplanschedule.dtos';
import { UserRepo } from '../../user/repository/user.repo';
import { STATUS_NOT_VISITED } from 'src/constants';

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
    accessToken: string,
  ): Promise<any[]> {
    try {
      const userCreate = await this.userRepository.findByToken(accessToken);
      if (!userCreate) {
        throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
      }

      createCallPlaScheduleDto.created_by = userCreate.email;

      const lastId = await this.callPlanScheduleRepository.findLastId();
      let currentId = lastId ? lastId.id + 1 : 1;

      const results = [];
      if (createCallPlaScheduleDto.survey_outlet_id) {
        const code_call_plan = generateCode('CL', currentId++);
        const newScheduleDto = {
          ...createCallPlaScheduleDto,
          survey_outlet_id: createCallPlaScheduleDto.survey_outlet_id,
          outlet_id: null,
          code_call_plan,
          status: STATUS_NOT_VISITED,
        };
        await this.callPlanScheduleRepository.createData(newScheduleDto);
        results.push(newScheduleDto);
      } else if (createCallPlaScheduleDto.outlet_id && createCallPlaScheduleDto.outlet_id.length > 0) {
        for (const outletId of createCallPlaScheduleDto.outlet_id) {
          const code_call_plan = generateCode('CL', currentId++);
          const newScheduleDto = {
            ...createCallPlaScheduleDto,
            outlet_id: outletId,
            code_call_plan,
            status: STATUS_NOT_VISITED,
          };

          const result = await this.callPlanScheduleRepository.createData(newScheduleDto);
          results.push(result);
        }
      } else {
        throw new HttpException('Outlet ID is required', HttpStatus.BAD_REQUEST);
      }
      return results;
    } catch (e) {
      logger.error('Error creating call plan schedule:', e.message, e.stack);
      throw new InternalServerErrorException('Failed to create call plan schedule');
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
    userId: number = null,
  ) {
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    return this.callPlanScheduleRepository.getByIdCallPlan(
      id,
      pageInt,
      limitInt,
      searchTerm,
      userId,
    );
  }

  async getByIdUser(id: string) {
    return this.callPlanScheduleRepository.getByIdUser(id);
  }
}
