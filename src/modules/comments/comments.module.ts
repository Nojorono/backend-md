import { Module } from '@nestjs/common';

import { CommentsService } from './service/comments.service';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserRepo } from '../user/repository/user.repo';
import { CommentsRepository } from './repository/comments.repository';
import { CommentsControllers } from './controllers/comments.controllers';
import { AppGateway } from 'src/socket/socket.gateaway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from '../notifications/service/notifications.service';
import { NotificationsRepository } from '../notifications/repository/notifications.repository';
import { ActivityRepository } from '../activity/repository/activity.repository';

@Module({
  controllers: [CommentsControllers],
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
  providers: [
    DrizzleService, 
    ActivityRepository,
    NotificationsService, 
    NotificationsRepository, 
    CommentsService, 
    UserRepo, 
    CommentsRepository, 
    AppGateway
  ],
  exports: [CommentsService, CommentsRepository],
})
export class CommentsModule {}
