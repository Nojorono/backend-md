import {
  IsString,
  IsInt,
  IsOptional,
  IsDate,
  Length,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class UpdateRangeFacilityDto {
  @ApiProperty({
    example: 1,
    description: 'Range Health Facilities',
    required: false,
  })
  @IsInt()
  @IsOptional()
  range_health_facilities?: number;

  @ApiProperty({ example: 1, description: 'Range Work Place', required: false })
  @IsInt()
  @IsOptional()
  range_work_place?: number;

  @ApiProperty({
    example: 1,
    description: 'Range Public Transportation Facilities',
    required: false,
  })
  @IsInt()
  @IsOptional()
  range_public_transportation_facilities?: number;

  @ApiProperty({
    example: 1,
    description: 'Range Worship Facilities',
    required: false,
  })
  @IsInt()
  @IsOptional()
  range_worship_facilities?: number;

  @ApiProperty({
    example: 1,
    description: 'Range Playground Facilities',
    required: false,
  })
  @IsInt()
  @IsOptional()
  range_playground_facilities?: number;

  @ApiProperty({
    example: 1,
    description: 'Range Educational Facilities',
    required: false,
  })
  @IsInt()
  @IsOptional()
  range_educational_facilities?: number;
}

export class CreateMdActivityDto {
  @ApiProperty({ example: 17, description: 'User ID' })
  @IsInt()
  user_id: number;

  @ApiProperty({ example: 1, description: 'Call Plan Schedule ID' })
  @IsInt()
  call_plan_schedule_id: number;

  @ApiProperty({ example: 1, description: 'Call Plan ID' })
  @IsInt()
  call_plan_id: number;

  @ApiProperty({ example: 1, description: 'Outlet ID', required: false })
  @IsInt()
  @IsOptional()
  outlet_id?: number | null;

  @ApiProperty({ example: 1, description: 'Survey Outlet ID', required: false })
  @IsInt()
  @IsOptional()
  survey_outlet_id?: number | null;

  @ApiProperty({ example: 1, description: 'Program ID', required: false })
  @IsInt()
  @IsOptional()
  program_id?: number | null;

  @ApiProperty({
    example: 200,
    description: 'Activity Status',
    required: false,
  })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiProperty({
    example: 'MAKASSAR',
    description: 'Area Name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  area?: string;

  @ApiProperty({
    example: 'SULAWESI',
    description: 'Region Name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  region?: string;

  @ApiProperty({
    example: 'CLASMILD',
    description: 'Brand Name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  brand?: string;

  @ApiProperty({
    example: 'SIO GT STANDARD',
    description: 'SIO Type',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 80)
  type_sio?: string;

  @ApiProperty({
    example: '2023-01-01T10:00:00Z',
    description: 'Activity Start Time',
  })
  @IsOptional()
  @Type(() => Date)
  start_time?: Date;

  @ApiProperty({
    example: '2023-01-01T11:00:00Z',
    description: 'Activity End Time',
  })
  @IsOptional()
  @Type(() => Date)
  end_time?: Date;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary'
    },
    description: 'Activity photos (max 5MB each)',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }
    return value ? [value] : [];
  })
  photos?: any;

  @ApiProperty({
    type: 'string', 
    format: 'binary',
    description: 'Activity photo program (max 5MB)',
    required: false,
  })
  @IsOptional()
  photo_program?: any;

  @ApiProperty({ example: 'user_creator', description: 'Created By User' })
  @IsOptional()
  @Length(1, 50)
  created_by: string;

  @ApiProperty({
    example: '2023-01-01T12:00:00Z',
    description: 'Creation Date',
  })
  @IsOptional()
  @Type(() => Date)
  created_at?: Date;

  @ApiProperty({
    type: UpdateRangeFacilityDto,
    description: 'Range Facility Data',
    required: false,
  })
  @ValidateNested({ each: true })
  @Type(() => UpdateRangeFacilityDto)
  @IsOptional()
  range_facility?: UpdateRangeFacilityDto;
}

export class UpdateMdActivityDto {
  @ApiProperty({ example: 1, description: 'Activity Status', required: false })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiProperty({
    example: '2023-01-01T13:00:00Z',
    description: 'Activity End Time',
    required: false,
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  end_time?: Date;

  @ApiProperty({
    example: 'user_updater',
    description: 'Updated By User',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  updated_by?: string;

  @ApiProperty({
    example: '2023-01-01T14:00:00Z',
    description: 'Update Date',
    required: false,
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  updated_at?: Date;
}

export class UpdateStatusDto {
  @ApiProperty({ example: 1, description: 'Activity Status', required: true })
  @IsNumber()
  status: number;
}
