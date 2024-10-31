export class CreateCallPlanDto {
  code_batch: string; // Required (varchar with length 20)
  area: string; // Required (varchar with length 20)
  region: string; // Required (varchar with length 20)
  start_plan: Date; // Required (date)
  end_plan: Date; // Required (date)
  created_by?: string; // Optional (varchar with length 50)
  created_at?: Date; // Optional, will default to current timestamp
  updated_by?: string; // Optional
  updated_at?: Date; // Optional, will default to current timestamp
  deleted_by?: string; // Optional
  deleted_at?: Date | null; // Optional, defaults to null
}

export class UpdateCallPlanDto {
  code_batch: string; // Required (varchar with length 20)
  area?: string; // Optional (varchar with length 20)
  region?: string; // Optional (varchar with length 20)
  start_plan?: Date; // Optional (date)
  end_plan?: Date; // Optional (date)
  updated_by?: string; // Optional (varchar with length 50)
  updated_at?: Date; // Optional, defaults to current timestamp
  deleted_by?: string; // Optional
  deleted_at?: Date | null; // Optional, defaults to null
}
