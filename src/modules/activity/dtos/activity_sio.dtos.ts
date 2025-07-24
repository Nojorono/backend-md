import { IsString, IsInt, IsOptional, IsNotEmpty, MinLength, MaxLength, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivitySioDto {
  @ApiProperty({ 
    example: 1,
    description: 'Unique identifier for the activity'
  })
  @IsInt()
  activity_id: number;

  @ApiProperty({ 
    example: 'Sample Activity Name',
    description: 'Name of the activity'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ 
    example: 'Detailed description of the activity',
    description: 'Description of what the activity entails'
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ 
    example: 'Additional notes about the activity',
    description: 'Optional notes or remarks'
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({ 
    type: 'string',
    description: 'URL of the activity photo',
    example: 'https://example.com/photo.jpg'
  })
  @IsOptional()
  @IsString()
  photo_before?: string;

  @ApiProperty({ 
    type: 'string',
    description: 'URL of the activity photo',
    example: 'https://example.com/photo.jpg'
  })
  @IsOptional()
  @IsString()
  photo_after?: string;
}
