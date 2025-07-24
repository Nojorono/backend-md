import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './service/user.service';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserRepo } from './repository/user.repo';
import { CommonModule } from '../../common/common.module';
import { MailerModule } from '@nest-modules/mailer';
import { S3Service } from '../s3/service/s3.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [UserController],
  imports: [
    CommonModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('auth.accessToken.secret'),
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_ACCESS_ID,
          pass: process.env.GMAIL_ACCESS_SECRET,
        },
      },
      defaults: {
        from: `"MD Customer Service" <noreply@gmail.com>`,
      },
    }),
  ],
  providers: [DrizzleService, UserRepo, UserService, S3Service],
  exports: [UserRepo, UserService, S3Service],
})
export class UserModule {}
