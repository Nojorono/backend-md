import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivityBranchDto {

  @ApiProperty({ example: 'CLASMILD' })
  @IsString()
  name: string;

  @ApiProperty({ example: '199' })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiProperty({ example: 'Sample description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Sample notes' })
  @IsString()
  @IsOptional()
  notes?: string;
} 