export class CreateDto {
  userId: number;
  date: Date;
  status: string;
  remarks: string;
  clockIn: Date;
  clockOut: Date;
}

export class UpdateDto {
  status?: string;
  remarks?: string;
  clockIn?: Date;
  clockOut?: Date;
}
