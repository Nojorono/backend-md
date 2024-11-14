import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserRepo } from '../user/repository/user.repo';
import { SioRepository } from './repository/sio.repository';
import { SioService } from './service/sio.service';
import { SioControllers } from './controllers/sio.controllers';

@Module({
  controllers: [SioControllers],
  imports: [CommonModule],
  providers: [DrizzleService, SioRepository, SioService, UserRepo],
  exports: [SioRepository, SioService],
})
export class SioModule {}
