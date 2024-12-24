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
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [CallPlanControllers, CallPlanScheduleControllers],
  imports: [CommonModule, JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get('auth.accessToken.secret'),
    }),
    inject: [ConfigService],
  }), ],
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
