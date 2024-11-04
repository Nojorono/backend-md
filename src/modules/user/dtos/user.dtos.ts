// src/user/dto/create-user.dto.ts
import { Exclude } from 'class-transformer';

export class CreateUserDto {
  username: string;
  user_role_id?: number;
  fullname?: string;
  password: string;
  email?: string;
  phone?: string;
  type_md?: string;
  area?: [];
  region?: string;
  is_active?: boolean;
  valid_from?: Date;
  valid_to?: Date;
}

// src/user/dto/update-user.dto.ts
export class UpdateUserDto {
  username?: string;
  user_role_id?: number;
  fullname?: string;
  password?: string;
  email?: string;
  area?: [];
  region?: string;
  phone?: string;
  type_md?: string;
  is_active?: boolean;
  valid_from?: Date;
  valid_to?: Date;
  remember_token?: string;
  last_login?: Date;
  created_at?: Date;
  created_by?: string;
  deleted_at?: Date;
  deleted_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export class UserResponseDto {
  id?: string;
  username?: string;
  roles?: string;
  email?: string;
  phone?: string;
  fullname?: string;
  region?: string;
  area?: string;
  type_md?: string;
  is_active?: string;
  last_login?: string;

  @Exclude()
  password?: string;
}
