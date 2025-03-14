import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { AuthService } from '../services/auth.service';
import { UserLoginDto } from '../dtos/auth.login.dto';
import { IAuthPayload } from '../interfaces/auth.interface';
import { AuthJwtRefreshGuard } from '../../../guards/jwt.refresh.guard';
import { ApiTags } from '@nestjs/swagger';
import { MessagePattern } from '@nestjs/microservices';
import { TransformMessagePayload } from 'src/decorators/payload.decorator';
import { AuthUser } from 'src/decorators/auth.decorator';
import { AuthResponseDto } from '../dtos/auth.response.dto';
import { Serialize } from 'src/decorators/serialize.decorator';
import { ForgotPasswordDto } from '../dtos/auth.forgot.dtos';

@ApiTags('auth')
@Controller({
  version: '1',
  path: '/auth',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('validateToken')
  @Post('validate-token')
  public async getUserByAccessToken(
    @TransformMessagePayload() payload: Record<string, any>,
  ) {
    return this.authService.verifyToken(payload.token);
  }

  @Public()
  @Serialize(AuthResponseDto)
  @Post('login')
  public login(@Body() payload: UserLoginDto): Promise<AuthResponseDto> {
    return this.authService.login(payload);
  }

  @Public()
  @UseGuards(AuthJwtRefreshGuard)
  @Get('refresh-token')
  public refreshTokens(@AuthUser() user: IAuthPayload) {
    return this.authService.generateTokens(user);
  }

  @Public()
  @Post('forgot-password')
  public async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<void> {
    await this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ): Promise<void> {
    await this.authService.resetPassword(token, newPassword);
  }
}
