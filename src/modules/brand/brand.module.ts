import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserRepo } from '../user/repository/user.repo';
import { BrandRepository } from './repository/brand.repository';
import { BrandService } from './service/brand.service';
import { BrandControllers } from './controllers/brand.controllers';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [BrandControllers],
  imports: [CommonModule, JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get('auth.accessToken.secret'),
    }),
    inject: [ConfigService],
  })],
  providers: [DrizzleService, BrandRepository, BrandService, UserRepo],
  exports: [BrandRepository, BrandService],
})
export class BrandModule {}
