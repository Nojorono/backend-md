import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { RegionControllers } from './controllers/region.controllers';
import { RegionRepository } from './repository/region.repository';
import { RegionService } from './service/region.service';
import { UserRepo } from '../user/repository/user.repo';
import { OutletRepository } from '../outlet/repository/outlet.repository';
import { AreaRepository } from './repository/area.repository';
import { AreaService } from './service/area.service';
import { AreaControllers } from './controllers/area.controllers';

@Module({
  controllers: [RegionControllers, AreaControllers],
  imports: [CommonModule],
  providers: [
    DrizzleService,
    RegionRepository,
    AreaRepository,
    RegionService,
    AreaService,
    UserRepo,
    OutletRepository,
  ],
  exports: [
    RegionRepository,
    AreaRepository,
    RegionService,
    AreaService,
  ],
})
export class RegionAreaModule {}
