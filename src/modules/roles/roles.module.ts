import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { RolesControllers } from './controllers/roles.controllers';
import { RolesRepository } from './repository/roles.repository';
import { RolesService } from './service/roles.service';

@Module({
  controllers: [RolesControllers],
  imports: [CommonModule],
  providers: [DrizzleService, RolesRepository, RolesService],
  exports: [RolesRepository, RolesService],
})
export class RolesModule {}
