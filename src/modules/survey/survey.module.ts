import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SurveyRepository } from './repository/survey.repository';
import { SurveyService } from './service/survey.service';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserRepo } from '../user/repository/user.repo';
import { SurveyControllers } from './controllers/survey.controllers';
import { OutletRepository } from '../outlet/repository/outlet.repository';
import { CallPlanRepository } from '../callplan/repository/callplan.repository';
@Module({
  controllers: [SurveyControllers],
  imports: [
    CommonModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('auth.accessToken.secret'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DrizzleService, SurveyRepository, UserRepo, SurveyService, OutletRepository, CallPlanRepository],
  exports: [SurveyRepository, UserRepo, SurveyService, OutletRepository, CallPlanRepository],
})
export class SurveyModule {}
