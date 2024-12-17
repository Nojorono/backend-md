import { IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivityBranchDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsOptional()
  activity_id: number;

  @ApiProperty({ example: 'CLASMILD' })
  @IsString()
  name: string;

  @ApiProperty({ example: 199 })
  @IsInt()
  @IsOptional()
  value?: number;

  @ApiProperty({ example: 'Sample description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Sample notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
