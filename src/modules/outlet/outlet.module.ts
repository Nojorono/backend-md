import { Module } from '@nestjs/common';

import { OutletRepository } from './repository/outlet.repository';
import { OutletController } from './controllers/outlet.controllers';
import { OutletService } from './service/outlet.service';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserRepo } from '../user/repository/user.repo';

@Module({
  controllers: [OutletController],
  imports: [CommonModule],
  providers: [DrizzleService, OutletRepository, UserRepo, OutletService],
  exports: [OutletRepository, UserRepo, OutletService],
})
export class OutletModule {}
