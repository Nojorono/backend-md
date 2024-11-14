import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserRepo } from '../user/repository/user.repo';
import { BrandRepository } from './repository/brand.repository';
import { BrandService } from './service/brand.service';
import { BrandControllers } from './controllers/brand.controllers';

@Module({
  controllers: [BrandControllers],
  imports: [CommonModule],
  providers: [DrizzleService, BrandRepository, BrandService, UserRepo],
  exports: [BrandRepository, BrandService],
})
export class BrandModule {}
