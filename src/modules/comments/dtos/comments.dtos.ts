export class CreateDto {
  id?: number;
  activity_id: number;
  outlet_id: number;
  user_id?: string;
  content: string;
  is_liked?: boolean;
  notification_identifier?: string;
  created_at?: Date;
}

export class UpdateDto {
  id: number;
  content: string;
  is_liked?: boolean;
  notification_identifier?: string;
}
