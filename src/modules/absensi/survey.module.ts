import { Module } from '@nestjs/common';

import { SurveyRepository } from './repository/absensi.repository';
import { SurveyService } from './service/absensi.service';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserRepo } from '../user/repository/user.repo';
import { SurveyControllers } from './controllers/absensi.controllers';
import { OutletRepository } from '../outlet/repository/outlet.repository';
import { CallPlanRepository } from '../callplan/repository/callplan.repository';
@Module({
  controllers: [SurveyControllers],
  imports: [CommonModule],
  providers: [DrizzleService, SurveyRepository, UserRepo, SurveyService, OutletRepository, CallPlanRepository],
  exports: [SurveyRepository, UserRepo, SurveyService, OutletRepository, CallPlanRepository],
})
export class SurveyModule {}
