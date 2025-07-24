export class CreateBatchDto {
  code_batch: string;
  start_plan: Date;
  end_plan: Date;
  created_by?: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;
}

export class UpdateBatchDto {
  code_batch?: string;
  start_plan?: Date;
  end_plan?: Date;
  created_by?: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;
  deleted_at?: Date;
  deleted_by?: string;
}
