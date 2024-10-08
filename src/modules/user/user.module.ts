import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './service/user.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [UserController],
  imports: [],
  providers: [UserService, ConfigService],
  exports: [UserService],
})
export class CloudinaryModule {}
