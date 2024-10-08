// src/user/dto/create-user.dto.ts
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
  fullname?: string;
  password?: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
}
