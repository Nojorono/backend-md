import { ApiProperty } from "@nestjs/swagger";

export class CreateDto {
  @ApiProperty({ description: 'User ID', example: '1' })
  userId: string;

  @ApiProperty({ description: 'Date of attendance', example: new Date().toISOString() })
  date: Date;

  @ApiProperty({ description: 'Region', example: 'JAWA BARAT' })
  region?: string;

  @ApiProperty({ description: 'Area', example: 'TANGERANG' })
  area?: string;

  @ApiProperty({ description: 'Attendance status', example: 'On Time' })
  status?: string;

  @ApiProperty({ description: 'Additional remarks', example: 'Work from office' })
  remarks?: string;

  @ApiProperty({ description: 'Clock in time', example: new Date().toISOString() })
  clockIn: Date;

  @ApiProperty({ description: 'Clock out time', example: new Date().toISOString() })
  clockOut?: Date;

  @ApiProperty({ description: 'Longitude coordinate', required: false, example: '106.816666' })
  longitude: string;

  @ApiProperty({ description: 'Latitude coordinate', required: false, example: '-6.200000' })
  latitude: string;

  @ApiProperty({ description: 'Photo In', required: false, example: '1' })
  photoIn?: string;
}

export class UpdateDto {
  
  @ApiProperty({ description: 'User ID', example: '1' })
  userId: string;

  @ApiProperty({ description: 'Additional remarks', required: false, example: 'Work from office' })
  remarks?: string;

  @ApiProperty({ description: 'Clock out time', required: false, example: new Date().toISOString() })
  clockOut: Date;

  @ApiProperty({ description: 'Longitude coordinate', required: false, example: '106.816666' })
  longitude: string;

  @ApiProperty({ description: 'Latitude coordinate', required: false, example: '-6.200000' })
  latitude: string;

  @ApiProperty({ description: 'Photo Out', required: false, example: '1' })
  photoOut?: string;
}
