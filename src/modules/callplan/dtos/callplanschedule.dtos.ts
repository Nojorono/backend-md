export class CreateCallPlanScheduleDto {
  code_call_plan: string; // Required (varchar with length 20)
  call_plan_id: string; // Required (integer referencing CallPlan)
  outlet_id: number; // Required (integer referencing mOutlets)
  user_id: number; // Required (integer referencing mOutlets)
  start_plan: Date; // Required (date)
  end_plan: Date; // Required (date)
  notes?: string; // Optional (varchar with length 255)
  created_by?: string; // Optional (varchar with length 50)
  created_at?: Date; // Optional, will default to current timestamp
  updated_by?: string; // Optional (varchar with length 50)
  updated_at?: Date; // Optional, will default to current timestamp
  deleted_by?: string; // Optional (varchar with length 50)
  deleted_at?: Date | null; // Optional, defaults to null
}

export class UpdateCallPlanScheduleDto {
  code_call_plan?: string; // Optional (varchar with length 20)
  outlet_id?: number; // Optional (integer referencing mOutlets)
  user_id: number; // Required (integer referencing mOutlets)
  start_plan?: Date; // Optional (date)
  end_plan?: Date; // Optional (date)
  notes?: string; // Optional (varchar with length 255)
  updated_by?: string; // Optional (varchar with length 50)
  updated_at?: Date; // Optional, defaults to current timestamp
  deleted_by?: string; // Optional (varchar with length 50)
  deleted_at?: Date | null; // Optional, defaults to null
}
