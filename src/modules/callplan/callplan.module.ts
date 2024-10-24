import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { CallPlanRepository } from './repository/callplan.repository';
import { CallPlanService } from './service/callplan.service';
import { CallPlanControllers } from './controllers/callplan.controllers';

@Module({
  controllers: [CallPlanControllers],
  imports: [CommonModule],
  providers: [DrizzleService, CallPlanRepository, CallPlanService],
  exports: [CallPlanRepository, CallPlanService],
})
export class CallPlanModule {}
