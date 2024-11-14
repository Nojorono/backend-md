export class CreateBrandDto {
  brand?: string;
  sog?: [];
  created_by?: string;
  created_at?: Date;
}

export class UpdateBrandDto {
  brand?: string;
  sog?: [];
  updated_by?: string;
  updated_at?: Date;
}
