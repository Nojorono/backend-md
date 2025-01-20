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
import { ActivityProgramRepository } from './repository/activity_program.repository';
import { ActivityProgramControllers } from './controllers/activityProgram.controllers';
import { ActivityProgramService } from './service/activity.program.service';
import { ActivityBranchService } from './service/activity.branch.service';
import { ActivitySogService } from './service/activity.sog.service';
import { ActivitySioService } from './service/activity.sio.service';
import { ActivitySioQueueProcessor } from './queue/activitySio.queue';
import { ActivityBranchQueueProcessor } from './queue/activityBranch.queue';
import { ActivityProgramQueueProcessor } from './queue/activityProgram.queue';
import { ActivitySogQueueProcessor } from './queue/activitySog.queue';
import { NotificationsService } from '../notifications/service/notifications.service';
import { NotificationsRepository } from '../notifications/repository/notifications.repository';
import { AppGateway } from 'src/socket/socket.gateaway';

@Module({
  controllers: [
    ActivityControllers,
    ActivitySioControllers,
    ActivitySogControllers,
    ActivityBranchControllers,
    ActivityProgramControllers,
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
    BullModule.registerQueue({
      name: 'activityQueue',
    }),
    BullModule.registerQueue({
      name: 'activityBranchQueue',
    }),
    BullModule.registerQueue({
      name: 'activitySogQueue',
    }),
    BullModule.registerQueue({
      name: 'activitySioQueue',
    }),
    BullModule.registerQueue({
      name: 'activityProgramQueue',
    }),
  ],
  providers: [
    DrizzleService,
    AppGateway,

    UserRepo,
    OutletRepository,
    CallPlanScheduleRepository,
    SurveyRepository,
    ActivityRepository,
    ActivitySioRepository,
    ActivitySogRepository,
    ActivityBranchRepository,
    NotificationsRepository,
    ActivityProgramRepository,

    S3Service,   
    QueueService,
    ActivityService,
    ActivityBranchService,
    ActivityProgramService,
    ActivitySogService,
    ActivitySioService, 
    NotificationsService,

    ActivityQueueProcessor,
    ActivitySioQueueProcessor,
    ActivityBranchQueueProcessor,
    ActivityProgramQueueProcessor,
    ActivitySogQueueProcessor,
  ],
  exports: [
    ActivityRepository,
    ActivityService,
    QueueService,
  ],
})
export class ActivityModule {}
