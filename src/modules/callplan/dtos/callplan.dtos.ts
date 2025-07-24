export class CreateCallPlanDto {
  code_batch: string;
  area: string;
  region: string;
  created_by?: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;
  deleted_by?: string;
  deleted_at?: Date | null;
}

export class UpdateCallPlanDto {
  code_batch: string;
  area?: string;
  region?: string;
  updated_by?: string;
  updated_at?: Date;
  deleted_by?: string;
  deleted_at?: Date | null;
}
