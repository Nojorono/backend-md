import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserRepo } from '../user/repository/user.repo';
import { ProgramRepository } from './repository/program.repository';
import { ProgramService } from './service/program.service';
import { ProgramControllers } from './controllers/program.controllers';

@Module({
  controllers: [ProgramControllers],
  imports: [CommonModule],
  providers: [DrizzleService, ProgramRepository, ProgramService, UserRepo],
  exports: [ProgramRepository, ProgramService],
})
export class ProgramModule {}
