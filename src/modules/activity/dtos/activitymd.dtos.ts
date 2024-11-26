import { IsString, IsInt, IsOptional, IsDate, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMdActivityDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  user_id: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  call_plan_schedule_id: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  outlet_id: number;

  @ApiProperty({ example: 'pending', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 'Area A', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  area?: string;

  @ApiProperty({ example: 'Region X', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  region?: string;

  @ApiProperty({ example: 'Brand A', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  brand?: string;

  @ApiProperty({ example: 'Type A', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 80)
  type_sio?: string;

  @ApiProperty({ example: '2023-01-01T10:00:00Z' })
  @IsDate()
  start_time: Date;

  @ApiProperty({ example: '2023-01-01T11:00:00Z' })
  @IsDate()
  end_time: Date;

  @ApiProperty({ example: 'user_creator' })
  @IsString()
  @Length(1, 50)
  created_by: string;

  @ApiProperty({ example: '2023-01-01T09:00:00Z' })
  @IsDate()
  created_at: Date;
}

export class UpdateMdActivityDto {
  @ApiProperty({ example: 'pending', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 'Area B', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  area?: string;

  @ApiProperty({ example: 'Region Y', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  region?: string;

  @ApiProperty({ example: 'Brand B', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  brand?: string;

  @ApiProperty({ example: 'Type B', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 80)
  type_sio?: string;

  @ApiProperty({ example: '2023-01-01T12:00:00Z', required: false })
  @IsDate()
  @IsOptional()
  start_time?: Date;

  @ApiProperty({ example: '2023-01-01T13:00:00Z', required: false })
  @IsDate()
  @IsOptional()
  end_time?: Date;

  @ApiProperty({ example: 'user_updater', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  updated_by?: string;

  @ApiProperty({ example: '2023-01-01T14:00:00Z', required: false })
  @IsDate()
  @IsOptional()
  updated_at?: Date;

  @ApiProperty({ example: 'user_deleter', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  deleted_by?: string;

  @ApiProperty({ example: '2023-01-01T15:00:00Z', required: false })
  @IsDate()
  @IsOptional()
  deleted_at?: Date;
}
