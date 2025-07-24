import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserRepo } from '../user/repository/user.repo';
import { ProgramRepository } from './repository/program.repository';
import { ProgramService } from './service/program.service';
import { ProgramControllers } from './controllers/program.controllers';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [ProgramControllers],
  imports: [CommonModule, JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get('auth.accessToken.secret'),
    }),
    inject: [ConfigService],
  }), ],
  providers: [DrizzleService, ProgramRepository, ProgramService, UserRepo],
  exports: [ProgramRepository, ProgramService],
})
export class ProgramModule {}
