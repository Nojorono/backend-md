import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserRepo } from '../user/repository/user.repo';
import { ActivityMdRepository } from './repository/activitymd.repository';
import { ActivityMdService } from './service/activitymd.service';
import { ActivityMdControllers } from './controllers/activitymd.controllers';
import { OutletRepository } from '../outlet/repository/outlet.repository';
import { CallPlanScheduleRepository } from '../callplan/repository/callplanschedule.repository';

@Module({
  controllers: [ActivityMdControllers],
  imports: [CommonModule],
  providers: [
    DrizzleService,
    ActivityMdRepository,
    ActivityMdService,
    UserRepo,
    OutletRepository,
    CallPlanScheduleRepository,
  ],
  exports: [ActivityMdRepository, ActivityMdService],
})
export class ActivityMdModule {}
