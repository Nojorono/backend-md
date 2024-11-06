export class CreateCallPlanScheduleDto {
  code_call_plan: string;
  call_plan_id: string;
  outlet_id?: [];
  user_id: number;
  start_plan: Date;
  end_plan: Date;
  notes?: string;
  created_by?: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;
  deleted_by?: string;
  deleted_at?: Date | null;
}

export class UpdateCallPlanScheduleDto {
  code_call_plan?: string; // Optional (varchar with length 20)
  outlet_id?: []; // Optional (integer referencing mOutlets)
  user_id: number; // Required (integer referencing mOutlets)
  start_plan?: Date; // Optional (date)
  end_plan?: Date; // Optional (date)
  notes?: string; // Optional (varchar with length 255)
  updated_by?: string; // Optional (varchar with length 50)
  updated_at?: Date; // Optional, defaults to current timestamp
  deleted_by?: string; // Optional (varchar with length 50)
  deleted_at?: Date | null; // Optional, defaults to null
}
