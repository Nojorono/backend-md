import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { CallPlanRepository } from './repository/callplan.repository';
import { CallPlanService } from './service/callplan.service';
import { CallPlanControllers } from './controllers/callplan.controllers';
import { CallPlanScheduleRepository } from './repository/callplanschedule.repository';
import { UserRepo } from '../user/repository/user.repo';
import { CallPlanScheduleControllers } from './controllers/callplanschedule.controllers';
import { CallPlanScheduleService } from './service/callplanschedule.service';

@Module({
  controllers: [CallPlanControllers, CallPlanScheduleControllers],
  imports: [CommonModule],
  providers: [
    DrizzleService,
    CallPlanRepository,
    CallPlanScheduleRepository,
    UserRepo,
    CallPlanService,
    CallPlanScheduleService,
  ],
  exports: [
    CallPlanScheduleRepository,
    CallPlanRepository,
    UserRepo,
    CallPlanService,
    CallPlanScheduleService,
  ],
})
export class CallPlanModule {}
