export class CreateCallPlanScheduleDto {
  code_call_plan: string;
  call_plan_id: string;
  outlet_id?: [];
  user_id: number;
  day_plan: Date;
  notes?: string;
  created_by?: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;
  deleted_by?: string;
  deleted_at?: Date | null;
}

export class UpdateCallPlanScheduleDto {
  code_call_plan?: string;
  outlet_id?: [];
  user_id: number;
  day_plan: Date;
  notes?: string;
  updated_by?: string;
  updated_at?: Date;
  deleted_by?: string;
  deleted_at?: Date | null;
}
