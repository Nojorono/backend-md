import {
  BadRequestException, HttpException, HttpStatus,
  Injectable, InternalServerErrorException,
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
import { MailerService } from '@nest-modules/mailer';
import bcrypt from 'bcrypt';
import { logger } from 'nestjs-i18n';

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
    private readonly mailerService: MailerService,
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

  async verifyRefreshToken(token: string): Promise<any> {
    const secretKey = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET_KEY',
    );

    try {
      // Using JwtService's verifyAsync method for asynchronous token verification
      return await this.jwtService.verifyAsync(token, {
        secret: secretKey,
      });
    } catch (error) {
      // Throw UnauthorizedException if the token is invalid or expired
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async generateTokens(user: IAuthPayload): Promise<ITokenResponse> {
    try {
      const accessTokenPromise = this.jwtService.signAsync(
        {
          id: user.id,
          user_role_id: user.user_role_id,
          username: user.username,
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
      const lowerCaseEmail = email.toLowerCase();
      const userFind = await this.userRepo.getUserByEmail(lowerCaseEmail);
      if (!userFind) {
        throw new HttpException('userNotFound', HttpStatus.NOT_FOUND);
      }
      const match = await this.helperHashService.match(
        password,
        userFind.password,
      );
      if (!match) {
        throw new HttpException('invalidPassword', HttpStatus.NOT_FOUND);
      }
      const { accessToken, refreshToken } = await this.generateTokens({
        id: userFind.id,
        user_role_id: userFind.user_role_id,
        username: userFind.username,
        email: userFind.email,
      });
      await this.userRepo.updateUser(userFind.id, {
        remember_token: accessToken,
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
      logger.error('Error login:', e.message, e.stack);
      if (e instanceof HttpException) {
        throw e;
      }
      throw new InternalServerErrorException('internalServerError');
    }
  }

  public async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepo.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User with this email not found');
    }
    const frontendBaseUrl = this.configService.get<string>('FRONTEND_BASE_URL');
    const { accessToken } = await this.generateTokens({
      id: user.id,
      user_role_id: user.user_role_id,
      username: user.username,
      email: user.email,
    });
    // Send the reset email using the MailerService
    const resetUrl = `${frontendBaseUrl}/reset-password?token=${accessToken}`;
    const emailBody = `
    <p><b>Hi ${user.fullname},</b></p>
    <p><b>please click the button below to reset your password:</b></p>
    <p style="text-align: center;">
      <a href="${resetUrl}" 
         style="display: inline-block; background-color: #4CAF50; color: white; padding: 15px 25px; font-size: 16px; text-decoration: none; border-radius: 5px;">
         Reset Password
      </a>
    </p>
    <p>If you did not request a password reset, please ignore this email.</p>`;

    // Send the email using the MailerService
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Password Reset Request VTrack',
      html: emailBody,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const decoded = await this.verifyToken(token);
    const user = await this.userRepo.getUserById(decoded.id);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Update user password (be sure to hash it)
    await this.userRepo.updateUser(user.id, {
      password: await bcrypt.hash(newPassword, 10),
      updated_by: 'system',
      updated_at: new Date(),
    });
  }
}
