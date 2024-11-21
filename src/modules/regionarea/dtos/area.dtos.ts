import { IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAreaDto {
  region_id: number;
  area: string;
  @IsOptional()
  @IsString()
  created_by?: string;
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  created_at?: Date;
}

export class UpdateAreaDto {
  region_id: number;
  area: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  created_at?: Date;
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updated_at?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deleted_at?: Date;

  @IsOptional()
  @IsString()
  updated_by?: string;

  @IsOptional()
  @IsString()
  deleted_by?: string;
}
