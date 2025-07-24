import { Injectable } from '@nestjs/common';
import { SurveyRepository } from '../repository/survey.repository';
import { CreateDto, UpdateDto } from '../dtos/survey.dtos';
import { OutletRepository } from 'src/modules/outlet/repository/outlet.repository';
import { CallPlanRepository } from 'src/modules/callplan/repository/callplan.repository';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SurveyService {
  constructor(
    private readonly SurveyRepository: SurveyRepository,
    private readonly outletRepository: OutletRepository,
    private readonly callPlanRepository: CallPlanRepository,
    private readonly jwtService: JwtService,
  ) {}

  async create(CreateDto: CreateDto, accessToken) {
    const decoded = this.jwtService.verify(accessToken);
    CreateDto.created_by = decoded.email;
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
    const decoded = this.jwtService.verify(accessToken);
    UpdateDto.updated_by = decoded.email;
    UpdateDto.updated_at = new Date();
    const result = this.SurveyRepository.updateData(id, UpdateDto);
    if (UpdateDto.outlet_id) {
      await this.outletRepository.updateOutlet(UpdateDto.outlet_id, {
        survey_outlet_id: id,
      });
    }
    return result;
  }

  async delete(id: number, accessToken: string) {
    const decoded = this.jwtService.verify(accessToken);
    const findData = await this.SurveyRepository.getById(id);
    await this.outletRepository.updateOutlet(findData.outlet_id, {
      survey_outlet_id: null,
    });
    return this.SurveyRepository.deleteById(id, decoded.email);
  }

  async getAll(
    accessToken: string,
    page: string = '1',
    limit: string = '10',
    searchTerm: string = '',
    isActive: string = '',
    filter: {
      area: string;
      region: string;
      brand: string;
      sio_type: string;
    } = { area: '', region: '', brand: '', sio_type: '' },
  ) {
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    return this.SurveyRepository.getAll(
      pageInt,
      limitInt,
      searchTerm,
      isActive,
      filter,
    );
  }

  async getSchedule(callPlanId: string) {
    const callPlan = await this.callPlanRepository.getById(callPlanId);
    return this.SurveyRepository.getSchedule(callPlan.area, callPlan.region);
  }
}
