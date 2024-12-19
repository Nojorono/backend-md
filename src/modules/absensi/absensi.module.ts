import { Module } from '@nestjs/common';

import { AbsensiRepository } from './repository/absensi.repository';
import { AbsensiService } from './service/absensi.service';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserRepo } from '../user/repository/user.repo';
import { AbsensiControllers } from './controllers/absensi.controllers';
import { S3Service } from '../s3/service/s3.service';

@Module({
  controllers: [AbsensiControllers],
  imports: [CommonModule],
  providers: [DrizzleService, AbsensiRepository, UserRepo, AbsensiService, S3Service],
  exports: [AbsensiRepository, UserRepo, AbsensiService],
})
export class AbsensiModule {}
