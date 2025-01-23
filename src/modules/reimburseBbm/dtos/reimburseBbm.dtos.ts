import { ApiProperty } from "@nestjs/swagger";

export class CreateDto {
  @ApiProperty({ type: String })
  user_id: string;
  @ApiProperty({ type: Date })
  date_in: Date;
  @ApiProperty({ type: Number })
  kilometer_in: number;
  @ApiProperty({ type: String })
  photo_in: string;
  @ApiProperty({ type: String })
  description: string;
}

export class UpdateDto {
  @ApiProperty({ type: Number })
  id: number;
  @ApiProperty({ type: Date })
  date_out: Date;
  @ApiProperty({ type: Number })
  kilometer_out: number;
  @ApiProperty({ type: String })
  photo_out: string;
  @ApiProperty({ type: String })
  description: string;
  @ApiProperty({ type: Number })
  total_kilometer: number;
}
