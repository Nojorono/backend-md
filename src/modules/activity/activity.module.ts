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
import { SurveyRepository } from '../survey/repository/survey.repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './service/queue.service';
import { ActivityQueueProcessor } from './queue/activity.queue';
@Module({
  controllers: [
    ActivityControllers,
    ActivitySioControllers,
    ActivitySogControllers,
    ActivityBranchControllers,
  ],
  imports: [
    CommonModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('auth.accessToken.secret'),
      }),
      inject: [ConfigService],
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    BullModule.registerQueue(
      { name: 'activityQueue' },
      { name: 'activityBranchQueue' },
      { name: 'activitySogQueue' },
      { name: 'activitySioQueue' },
    ),
  ],
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
    SurveyRepository,
    QueueService,
    ActivityQueueProcessor,
  ],
  exports: [
    ActivityRepository,
    ActivityService,
    QueueService,
  ],
})
export class ActivityModule {}
