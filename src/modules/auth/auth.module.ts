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

@Module({
  imports: [
    PassportModule.register({
      session: false,
    }),
    JwtModule.register({}),
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
  ],
  exports: [AuthService, HelperHashService],
})
export class AuthModule {}
