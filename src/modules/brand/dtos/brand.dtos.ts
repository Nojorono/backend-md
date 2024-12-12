export class CreateBrandDto {
  brand?: string;
  sog?: [];
  branch?: [];
  color?: string;
  created_by?: string;
  created_at?: Date;
}

export class UpdateBrandDto {
  brand?: string;
  sog?: [];
  branch?: [];
  color?: string;
  updated_by?: string;
  updated_at?: Date;
}
