import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { RolesControllers } from './controllers/roles.controllers';
import { RolesRepository } from './repository/roles.repository';
import { RolesService } from './service/roles.service';
import { UserRepo } from '../user/repository/user.repo';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [RolesControllers],
  imports: [CommonModule, JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get('auth.accessToken.secret'),
    }),
    inject: [ConfigService],
  })],
  providers: [DrizzleService, RolesRepository, RolesService, UserRepo],
  exports: [RolesRepository, RolesService],
})
export class RolesModule {}
