export class CreateDto {
  userId: string;
  date: Date;
  status: string;
  remarks: string;
  clockIn: Date;
  clockOut: Date;
  longitude?: string;
  latitude?: string;
}

export class UpdateDto {
  userId: string;
  date: Date;
  status?: string;
  remarks?: string;
  clockIn?: Date;
  clockOut?: Date;
  longitude?: string;
  latitude?: string;
}
