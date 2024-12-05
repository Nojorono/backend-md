import { Module } from '@nestjs/common';

import { NotificationsService } from './service/notifications.service';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserRepo } from '../user/repository/user.repo';
import { NotificationsRepository } from './repository/notifications.repository';
import { NotificationsControllers } from './controllers/notifications.controllers';
import { AppGateway } from 'src/socket/socket.gateaway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [NotificationsControllers],
  imports: [CommonModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('auth.accessToken.secret'),
      }),
      inject: [ConfigService],
    }),
  ],  
  providers: [DrizzleService, NotificationsService, UserRepo, NotificationsRepository, AppGateway],
  exports: [NotificationsService, NotificationsRepository],
})
export class NotificationsModule {}
