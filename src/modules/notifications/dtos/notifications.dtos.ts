export class CreateDto {
  id?: number;
  message?: string;
  user_id?: string;
  is_read?: boolean;
  notification_identifier: string;
  type: number;
  activity_id?: number;
  created_at?: Date;
}

export class UpdateDto {
  id: number;
  is_read: boolean;
}
