import { IsString, IsInt, IsOptional, IsDate, Length, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ActivitySioDto } from './activity_sio.dtos';
import { ActivitySogDto } from './activity_sog.dtos';
import { ActivityBranchDto } from './activity_branch.dtos';

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

  @ApiProperty({ example: 200, description: 'Activity Status', required: false })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiProperty({ example: 'MAKASSAR', description: 'Area Name', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  area?: string;

  @ApiProperty({ example: 'SULAWESI', description: 'Region Name', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  region?: string;

  @ApiProperty({ example: 'CLASMILD', description: 'Brand Name', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  brand?: string;

  @ApiProperty({ example: 'SIO GT STANDARD', description: 'SIO Type', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 80)
  type_sio?: string;

  @ApiProperty({ example: '2023-01-01T10:00:00Z', description: 'Activity Start Time' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  start_time?: Date;

  @ApiProperty({ example: '2023-01-01T11:00:00Z', description: 'Activity End Time' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  end_time?: Date;

  @ApiProperty({ example: ['https://via.placeholder.com/300.png/09f/fff?text=Test+Image'], description: 'Activity Photos', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @ApiProperty({ example: 'user_creator', description: 'Created By User' })
  @IsString()
  @Length(1, 50)
  created_by: string;

  @ApiProperty({ example: '2023-01-01T12:00:00Z', description: 'Creation Date' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  created_at?: Date;
  
  // @ApiProperty({ type: [ActivitySioDto], description: 'Activity SIO Data', required: false })
  // @ValidateNested({ each: true })
  // @Type(() => ActivitySioDto)
  // @IsOptional()
  // activity_sio?: ActivitySioDto[];

  // @ApiProperty({ type: [ActivitySogDto], description: 'Activity SOG Data', required: false })
  // @ValidateNested({ each: true })
  // @Type(() => ActivitySogDto)
  // @IsOptional()
  // activity_sog?: ActivitySogDto[];

  // @ApiProperty({ type: [ActivityBranchDto], description: 'Activity Branch Data', required: false })
  // @ValidateNested({ each: true })
  // @Type(() => ActivityBranchDto)
  // @IsOptional()
  // activity_branch?: ActivityBranchDto[];
}

export class UpdateMdActivityDto {
  @ApiProperty({ example: 1, description: 'Activity Status', required: false })
  @IsInt()
  @IsOptional()
  status?: number;

  @ApiProperty({ example: '2023-01-01T13:00:00Z', description: 'Activity End Time', required: false })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  end_time?: Date;

  @ApiProperty({ example: 'user_updater', description: 'Updated By User', required: false })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  updated_by?: string;

  @ApiProperty({ example: '2023-01-01T14:00:00Z', description: 'Update Date', required: false })
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