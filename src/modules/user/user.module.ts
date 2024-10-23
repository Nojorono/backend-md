import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './service/user.service';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserRepo } from './repository/user.repo';
import { CommonModule } from '../../common/common.module';

@Module({
  controllers: [UserController],
  imports: [CommonModule],
  providers: [DrizzleService, UserRepo, UserService],
  exports: [UserRepo, UserService],
})
export class UserModule {}
