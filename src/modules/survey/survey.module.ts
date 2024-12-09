import { Module } from '@nestjs/common';

import { SurveyRepository } from './repository/survey.repository';
import { SurveyService } from './service/survey.service';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserRepo } from '../user/repository/user.repo';
import { SurveyControllers } from './controllers/survey.controllers';
import { OutletRepository } from '../outlet/repository/outlet.repository';

@Module({
  controllers: [SurveyControllers],
  imports: [CommonModule],
  providers: [DrizzleService, SurveyRepository, UserRepo, SurveyService, OutletRepository],
  exports: [SurveyRepository, UserRepo, SurveyService, OutletRepository],
})
export class SurveyModule {}
