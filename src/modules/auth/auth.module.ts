import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { HelperHashService } from './services/helper.hash.service';
import { PassportModule } from '@nestjs/passport';
import { AuthJwtAccessStrategy } from 'src/strategies/jwt.access.strategy';
import { AuthJwtRefreshStrategy } from 'src/strategies/jwt.refresh.strategy';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserService } from '../user/service/user.service';
import { UserRepo } from '../user/repository/user.repo';
import { MailerModule } from '@nest-modules/mailer';
import { S3Service } from '../s3/service/s3.service';

@Module({
  imports: [
    PassportModule.register({
      session: false,
    }),
    JwtModule.register({}),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_ACCESS_ID,
          pass: process.env.GMAIL_ACCESS_SECRET,
        },
      },
      defaults: {
        from: `"VIMEPS Assistants" <noreply@gmail.com>`,
      },
    }),
    // MailerModule.forRoot({
    //   transport: {
    //     host: 'smtp.gmail.com',
    //     port: 465, // Gunakan 587 untuk STARTTLS atau 465 untuk SSL
    //     secure: true, // true untuk 465, false untuk 587
    //     auth: {
    //       user: process.env.GMAIL_ACCESS_ID,
    //       pass: process.env.GMAIL_ACCESS_SECRET,
    //     },
    //   },
    //   defaults: {
    //     from: `"VTrack Assistants" <${process.env.GMAIL_ACCESS_ID}>`,
    //   },
    // }),
  ],
  controllers: [AuthController],
  providers: [
    AuthJwtAccessStrategy,
    AuthJwtRefreshStrategy,
    AuthService,
    HelperHashService,
    UserRepo,
    UserService,
    DrizzleService,
    S3Service,
  ],
  exports: [AuthService, HelperHashService],
})
export class AuthModule {}
