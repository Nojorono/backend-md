import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { BatchControllers } from './controllers/batch.controllers';
import { BatchRepository } from './repository/batch.repository';
import { BatchService } from './service/batch.service';
import { UserRepo } from '../user/repository/user.repo';
import { OutletRepository } from '../outlet/repository/outlet.repository';
import { BatchTargetRepository } from './repository/batchtarget.repository';
import { BatchTargetService } from './service/batchtarget.service';
import { BatchTargetControllers } from './controllers/batchtarget.controllers';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [BatchControllers, BatchTargetControllers],
  imports: [CommonModule, JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get('auth.accessToken.secret'),
    }),
    inject: [ConfigService],
  })],
  providers: [
    DrizzleService,
    BatchRepository,
    BatchTargetRepository,
    BatchService,
    BatchTargetService,
    UserRepo,
    OutletRepository,
  ],
  exports: [
    BatchRepository,
    BatchTargetRepository,
    BatchService,
    BatchTargetService,
  ],
})
export class BatchModule {}
