import { Module } from '@nestjs/common';

import { ReimburseBbmRepository } from './repository/reimburseBbm.repository';
import { ReimburseBbmService } from './service/reimburseBbm.service';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserRepo } from '../user/repository/user.repo';
import { ReimburseBbmControllers } from './controllers/reimburseBbm.controllers';
import { S3Service } from '../s3/service/s3.service';

@Module({
  controllers: [ReimburseBbmControllers],
  imports: [CommonModule],
  providers: [DrizzleService, ReimburseBbmRepository, UserRepo, ReimburseBbmService, S3Service],
  exports: [ReimburseBbmRepository, UserRepo, ReimburseBbmService],
})
export class ReimburseBbmModule {}
