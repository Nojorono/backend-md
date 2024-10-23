import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { UserResponseDto } from '../../user/dtos/user.dtos';
export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;

  @ApiProperty()
  @Type(() => UserResponseDto)
  @ValidateNested()
  user: UserResponseDto;
}
