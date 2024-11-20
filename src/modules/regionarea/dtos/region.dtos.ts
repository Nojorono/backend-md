export class CreateRegionDto {
  name: string;
  created_by?: string;
  created_at?: Date;
}

export class UpdateRegionDto {
  name: string;
  updated_by?: string;
  updated_at?: Date;
  deleted_at?: Date;
  deleted_by?: string;
}
