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

  // @MessagePattern('getUserPermissionsFromRole')
  // public async getUserPermissionsFromRole(
  //   @TransformMessagePayload() payload: Record<string, any>,
  // ) {
  //   return this.authService.getPermissionsFromRole({
  //     role: payload.role,
  //     module: payload.module,
  //   });
  // }

  @Public()
  @Serialize(AuthResponseDto)
  @Post('login')
  public login(@Body() payload: UserLoginDto): Promise<AuthResponseDto> {
    console.log(payload);
    return this.authService.login(payload);
  }

  @Public()
  @UseGuards(AuthJwtRefreshGuard)
  @Get('refresh-token')
  public refreshTokens(@AuthUser() user: IAuthPayload) {
    return this.authService.generateTokens(user);
  }
}
