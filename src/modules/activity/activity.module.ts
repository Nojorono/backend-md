import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserRepo } from '../user/repository/user.repo';
import { ActivityRepository } from './repository/activity.repository';
import { ActivityService } from './service/activity.service';
import { ActivityControllers } from './controllers/activity.controllers';
import { OutletRepository } from '../outlet/repository/outlet.repository';
import { CallPlanScheduleRepository } from '../callplan/repository/callplanschedule.repository';
import { ActivitySioRepository } from './repository/activity_sio.repository';
import { ActivitySogRepository } from './repository/activity_sog.repository';
import { S3Service } from '../s3/service/s3.service';
import { ActivityBranchRepository } from './repository/activity_branch.repository';
import { ActivitySioControllers } from './controllers/activitySio.controllers';
import { ActivitySogControllers } from './controllers/activitySog.controllers';
import { ActivityBranchControllers } from './controllers/activityBranch.controllers';
import {SurveyRepository} from '../survey/repository/survey.repository'
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';


@Module({
  controllers: [
    ActivityControllers,
    ActivitySioControllers,
    ActivitySogControllers,
    ActivityBranchControllers,
  ],
  imports: [CommonModule, JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get('auth.accessToken.secret'),
    }),
    inject: [ConfigService],
  })],
  providers: [
    DrizzleService,
    ActivityRepository,
    ActivitySioRepository,
    ActivitySogRepository,
    ActivityBranchRepository,
    S3Service,
    ActivityService,
    UserRepo,
    OutletRepository,
    CallPlanScheduleRepository,
    SurveyRepository
  ],
  exports: [ActivityRepository, ActivityService],
})
export class ActivityModule {}
