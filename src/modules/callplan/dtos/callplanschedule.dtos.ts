export class CreateCallPlanScheduleDto {
  code_call_plan: string;
  call_plan_id: string;
  outlet_id?: [];
  user_id: number;
  day_plan: Date;
  notes?: string;
  type?: number;
  survey_outlet_id?: number;
  program_id?: number;
  status?: number;
  created_by?: string;
  created_at?: Date;
}

export class UpdateCallPlanScheduleDto {
  code_call_plan?: string;
  outlet_id?: [];
  user_id: number;
  day_plan: Date;
  notes?: string;
  type?: number;
  survey_outlet_id?: number;
  program_id?: number;
  status?: number;
  updated_by?: string;
  updated_at?: Date;
  deleted_by?: string;
  deleted_at?: Date | null;
}

export class validateScheduleDto {
  day_plan: Date;
  outlet_id: number;
  survey_outlet_id: number;
}
