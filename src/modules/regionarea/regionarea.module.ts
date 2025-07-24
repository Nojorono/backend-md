import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { RegionControllers } from './controllers/region.controllers';
import { RegionRepository } from './repository/region.repository';
import { RegionService } from './service/region.service';
import { UserRepo } from '../user/repository/user.repo';
import { AreaRepository } from './repository/area.repository';
import { AreaService } from './service/area.service';
import { AreaControllers } from './controllers/area.controllers';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [RegionControllers, AreaControllers],
  imports: [
    CommonModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('auth.accessToken.secret'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    DrizzleService,
    RegionRepository,
    AreaRepository,
    RegionService,
    AreaService,
    UserRepo,
  ],
  exports: [RegionRepository, AreaRepository, RegionService, AreaService],
})
export class RegionAreaModule {}
