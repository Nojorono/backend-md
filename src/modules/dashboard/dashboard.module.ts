import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserRepo } from '../user/repository/user.repo';
import { AppGateway } from 'src/socket/socket.gateaway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { DashboardService } from './service/dashboard.service';
import { DashboardControllers } from './controllers/dashboard.controllers';
import { OutletRepository } from '../outlet/repository/outlet.repository';
import { BatchRepository } from '../batch/repository/batch.repository';
import { AbsensiRepository } from '../absensi/repository/absensi.repository';
import { CallPlanRepository } from '../callplan/repository/callplan.repository';
import { ProgramRepository } from '../program/repository/program.repository';
import { SurveyRepository } from '../survey/repository/survey.repository';
import { BrandRepository } from '../brand/repository/brand.repository';
import { CallPlanScheduleRepository } from '../callplan/repository/callplanschedule.repository';
import { ActivityRepository } from '../activity/repository/activity.repository';

@Module({
  controllers: [DashboardControllers],
  imports: [
    CommonModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('auth.accessToken.secret'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    DrizzleService,
    AppGateway,
    DashboardService,
    ActivityRepository,
    UserRepo,
    BatchRepository,
    BrandRepository,
    CallPlanRepository,
    CallPlanScheduleRepository,
    OutletRepository,
    ProgramRepository,
    SurveyRepository,
    AbsensiRepository,
],
  exports: [DashboardService],
})
export class DashboardModule {}
