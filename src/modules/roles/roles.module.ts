import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { RolesControllers } from './controllers/roles.controllers';
import { RolesRepository } from './repository/roles.repository';
import { RolesService } from './service/roles.service';
import { UserRepo } from '../user/repository/user.repo';

@Module({
  controllers: [RolesControllers],
  imports: [CommonModule],
  providers: [DrizzleService, RolesRepository, RolesService, UserRepo],
  exports: [RolesRepository, RolesService],
})
export class RolesModule {}
