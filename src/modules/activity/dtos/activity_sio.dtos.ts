import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivitySioDto {

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

  @ApiProperty({ example: 'https://via.placeholder.com/300.png/09f/fff?text=Test+Image', required: false })
  @IsString()
  @IsOptional()
  photo?: string;
} 