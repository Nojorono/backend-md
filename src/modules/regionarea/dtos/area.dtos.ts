export class CreateAreaDto {
  region_id: string;
  area: string;
  created_by?: string;
  created_at?: Date;
}

export class UpdateAreaDto {
  region_id: string;
  area: string;
  updated_by?: string;
  updated_at?: Date;
  deleted_at?: Date;
  deleted_by?: string;
}
