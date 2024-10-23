import { Module } from '@nestjs/common';

import { OutletRepository } from './repository/outlet.repository';
import { OutletController } from './controllers/outlet.controllers';
import { OutletService } from './service/outlet.service';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';

@Module({
  controllers: [OutletController],
  imports: [CommonModule],
  providers: [DrizzleService, OutletRepository, OutletService],
  exports: [OutletRepository, OutletService],
})
export class OutletModule {}
