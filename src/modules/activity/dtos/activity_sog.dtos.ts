import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivitySogDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  activity_id: number;

  @ApiProperty({ example: 'Sample Name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Sample Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Sample Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
} 