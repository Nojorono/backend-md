import { Injectable, HttpException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CallPlanScheduleRepository } from '../repository/callplanschedule.repository';
import { generateCode } from '../../../helpers/nojorono.helpers';
import { logger } from 'nestjs-i18n';
import {
  CreateCallPlanScheduleDto,
  UpdateCallPlanScheduleDto,
} from '../dtos/callplanschedule.dtos';
import { STATUS_NOT_VISITED } from 'src/constants';
import { JwtService } from '@nestjs/jwt';
import * as xlsx from 'xlsx';
import { OutletRepository } from 'src/modules/outlet/repository/outlet.repository';
import { UserRepo } from 'src/modules/user/repository/user.repo';
import { ProgramRepository } from 'src/modules/program/repository/program.repository';
import { CallPlanRepository } from '../repository/callplan.repository';
@Injectable()
export class CallPlanScheduleService {
  constructor(
    private readonly callPlanScheduleRepository: CallPlanScheduleRepository,
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepo,
    private readonly outletRepository: OutletRepository,
    private readonly programRepository: ProgramRepository,
    private readonly callPlanRepository: CallPlanRepository,
  ) {}

  async updateCallPlanSchedule(
    id: string,
    updateCallPlanScheduleDto: UpdateCallPlanScheduleDto,
    accessToken,
  ) {
    try {
      const decoded = this.jwtService.verify(accessToken);
      updateCallPlanScheduleDto.updated_by = decoded.email;
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
      const decoded = this.jwtService.verify(accessToken);
      createCallPlaScheduleDto.created_by = decoded.email;

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
    const decoded = this.jwtService.verify(accessToken);
    return this.callPlanScheduleRepository.deleteById(id, decoded.email);
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

  async historyGetByIdUser(id: string) {
    return this.callPlanScheduleRepository.getHistoryByIdUser(id);
  }

  async importSchedule(file: Express.Multer.File, call_plan_id: string, accessToken: string) {
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const data: any[] = [];

    // Assuming the first sheet contains the data
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Type the jsonData as an array of arrays
    const jsonData: (string | number | undefined)[][] =
      xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    // Skip the header row and process remaining data
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row.length > 0) {
        // Convert Excel date number to date string
        let dayPlan = row[4];
        if (typeof dayPlan === 'number') {
          // Excel dates are number of days since 1900-01-01
          // Convert to JavaScript Date then format as YYYY-MM-DD
          const date = new Date((dayPlan - 25569) * 86400 * 1000);
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
          const year = date.getFullYear();
          dayPlan = `${year}-${month}-${day}`; // Use ISO format YYYY-MM-DD
        }

        // Find user and outlet based on email and code
        const user = row[2] ? await this.userRepository.findByEmail(row[2].toString()) : null;
        const outlet = row[3] ? await this.outletRepository.findByCode(row[3].toString()) : null;
        const program = row[5] ? await this.programRepository.findByName(row[5].toString()) : null;

        if (!user) {
          throw new NotFoundException('User not found');
        }

        if (user.region !== row[0] && user.area !== row[1]) {
          throw new NotFoundException('User not equal with region and area');
        }

        if (!outlet) {
          throw new NotFoundException('Outlet not found');
        }

        // Parse date string in ISO format
        const parsedDate = new Date(dayPlan);
        if (isNaN(parsedDate.getTime())) {
          throw new Error(`Invalid date format for day_plan: ${dayPlan}`);
        }

        const scheduleDto: CreateCallPlanScheduleDto = {
          code_call_plan : '',
          call_plan_id: call_plan_id,
          outlet_id: [outlet.id] as any,
          user_id: user.id,
          day_plan: parsedDate,
          notes: '',
          type: 0,
          program_id: program?.id || null,
          created_by: 'import',
          created_at: new Date(),
          status: STATUS_NOT_VISITED
        };
        try {
          const result = await this.createCallPlanSchedule(scheduleDto, accessToken);
          data.push(result);
        } catch (e) {
          logger.error('Error creating schedule:', e.message, e.stack);
          throw new InternalServerErrorException(`Failed to create schedule for row ${i + 1}`);
        }
      }
    }

    return data;
  }

} 
