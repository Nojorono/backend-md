import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { BatchControllers } from './controllers/batch.controllers';
import { BatchRepository } from './repository/batch.repository';
import { BatchService } from './service/batch.service';
import { UserRepo } from '../user/repository/user.repo';

@Module({
  controllers: [BatchControllers],
  imports: [CommonModule],
  providers: [DrizzleService, BatchRepository, BatchService, UserRepo],
  exports: [BatchRepository, BatchService],
})
export class BatchModule {}
