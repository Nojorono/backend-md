// src/user/dto/create-user.dto.ts
import { Exclude } from 'class-transformer';

export class CreateUserDto {
  username: string;
  user_role_id?: number;
  fullname?: string;
  password: string;
  email?: string;
  phone?: string;
  tipe_md?: string;
  is_active?: boolean;
  is_android?: boolean;
  is_web?: boolean;
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
  phone?: string;
  tipe_md?: string;
  is_active?: boolean;
  is_android?: boolean;
  is_web?: boolean;
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
  created_at: Date;
  deleted_at: Date;
  email: string;
  id: number;
  phone: string;
  valid_to: Date;
  username: string;

  @Exclude()
  password: string;
}
