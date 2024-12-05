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

@Module({
  controllers: [ActivityControllers],
  imports: [CommonModule],
  providers: [
    DrizzleService,
    ActivityRepository,
    ActivitySioRepository,
    ActivitySogRepository,
    S3Service,
    ActivityService,
    UserRepo,
    OutletRepository,
    CallPlanScheduleRepository,
  ],
  exports: [ActivityRepository, ActivityService],
})
export class ActivityModule {}
