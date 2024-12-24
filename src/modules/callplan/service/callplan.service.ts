import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateCallPlanDto, UpdateCallPlanDto } from '../dtos/callplan.dtos';
import { CallPlanRepository } from '../repository/callplan.repository';
import { logger } from 'nestjs-i18n';
import { UserRepo } from '../../user/repository/user.repo';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CallPlanService {
  constructor(
    private readonly callPlanRepository: CallPlanRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createCallPlan(
    createCallPlanDto: CreateCallPlanDto,
    accessToken: string,
  ) {
    try {
      const check =
        await this.callPlanRepository.validateCreate(createCallPlanDto);
      if (check.length > 0) {
        throw new HttpException('DataExists', HttpStatus.BAD_REQUEST);
      }
      const decoded = this.jwtService.verify(accessToken);
      return this.callPlanRepository.createData(createCallPlanDto, decoded.email);
    } catch (e) {
      // Log the error and its stack trace for more insight
      logger.error('Error in createCallPlan:', e.message, e.stack);
      if (e instanceof HttpException) {
        throw e;
      }
      throw new InternalServerErrorException('Failed to create call plan');
    }
  }

  async getCallPlanById(id: string) {
    return this.callPlanRepository.getById(id);
  }

  async updateCallPlan(
    id: string,
    updateCallPlanDto: UpdateCallPlanDto,
    accessToken: string,
  ) {
    const decoded = this.jwtService.verify(accessToken);
    return this.callPlanRepository.updateData(
      id,
      updateCallPlanDto,
      decoded.email,
    );
  }

  async deleteCallPlan(id: string, accessToken: string) {
    const decoded = this.jwtService.verify(accessToken);
    return this.callPlanRepository.deleteById(id, decoded.email);
  }

  async getAll(
    page: string = '1',
    limit: string = '10',
    searchTerm: string = '',
    filter: { area: string; region: string; } = { area: '', region: '' },
  ) {
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
      return this.callPlanRepository.getAllCallPlan(
        pageInt,
        limitInt,
        searchTerm,
        filter,
      );
  }
}
