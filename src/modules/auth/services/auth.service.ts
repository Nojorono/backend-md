import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  IAuthPayload,
  ITokenResponse,
  TokenType,
} from '../interfaces/auth.interface';
import { UserLoginDto } from '../dtos/auth.login.dto';
import { HelperHashService } from './helper.hash.service';
import { IAuthService } from '../interfaces/auth.service.interface';
import { AuthResponseDto } from '../dtos/auth.response.dto';
import { UserRepo } from '../../user/repository/user.repo';

@Injectable()
export class AuthService implements IAuthService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExp: string;
  private readonly refreshTokenExp: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepo,
    private readonly helperHashService: HelperHashService,
  ) {
    this.accessTokenSecret = this.configService.get<string>(
      'auth.accessToken.secret',
    );
    this.refreshTokenSecret = this.configService.get<string>(
      'auth.refreshToken.secret',
    );
    this.accessTokenExp = this.configService.get<string>(
      'auth.accessToken.expirationTime',
    );
    this.refreshTokenExp = this.configService.get<string>(
      'auth.refreshToken.expirationTime',
    );
  }

  async verifyToken(accessToken: string): Promise<IAuthPayload> {
    try {
      const data = await this.jwtService.verifyAsync(accessToken, {
        secret: this.accessTokenSecret,
      });
      return data as IAuthPayload; // Ensure the returned data conforms to IAuthPayload
    } catch (error) {
      // Handle specific JWT errors
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      } else if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      // Re-throw any unexpected errors
      throw new UnauthorizedException('Token validation failed');
    }
  }

  async generateTokens(user: IAuthPayload): Promise<ITokenResponse> {
    try {
      const accessTokenPromise = this.jwtService.signAsync(
        {
          id: user.id,
          user_role_id: user.user_role_id,
          username: user.username,
          is_active: user.is_active,
          tokenType: TokenType.ACCESS_TOKEN,
        },
        {
          secret: this.accessTokenSecret,
          expiresIn: this.accessTokenExp,
        },
      );
      const refreshTokenPromise = this.jwtService.signAsync(
        {
          id: user.id,
          user_role_id: user.user_role_id,
          username: user.username,
          is_active: user.is_active,
          tokenType: TokenType.REFRESH_TOKEN,
        },
        {
          secret: this.refreshTokenSecret,
          expiresIn: this.refreshTokenExp,
        },
      );
      const [accessToken, refreshToken] = await Promise.all([
        accessTokenPromise,
        refreshTokenPromise,
      ]);
      return {
        accessToken,
        refreshToken,
      };
    } catch (e) {
      throw e;
    }
  }

  async login(data: UserLoginDto): Promise<AuthResponseDto> {
    try {
      const { email, password } = data;
      const userFind = await this.userRepo.getUserByEmail(email);
      console.log('test', userFind);
      if (!userFind) {
        throw new NotFoundException('userNotFound');
      }
      const match = await this.helperHashService.match(
        password,
        userFind.password,
      );
      if (!match) {
        throw new NotFoundException('invalidPassword');
      }
      const { accessToken, refreshToken } = await this.generateTokens({
        id: userFind.id,
        user_role_id: userFind.user_role_id,
        username: userFind.username,
        is_active: userFind.is_active,
        email: userFind.email,
      });
      await this.userRepo.updateUser(userFind.id, {
        remember_token: accessToken,
        last_login: new Date(),
        updated_by: 'system',
        updated_at: new Date(),
      });
      const user = await this.userRepo.getUserById(userFind.id);
      return {
        accessToken,
        refreshToken,
        user,
      };
    } catch (e) {
      throw e;
    }
  }
}
