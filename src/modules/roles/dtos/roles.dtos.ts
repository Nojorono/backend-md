export class CreateRolesDto {
  name?: string;
  description?: string;
  is_active?: number;
  is_mobile?: number;
  is_web?: number;
  created_by?: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;
}

export class UpdateRolesDto {
  name?: string;
  description?: string;
  is_active?: number;
  is_mobile?: number;
  is_web?: number;
  updated_by?: string;
  updated_at?: Date;
}
