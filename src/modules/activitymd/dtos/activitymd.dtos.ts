export class CreateMdActivityDto {
  user_id: number; // Ensure required fields
  code_outlet: string;
  code_call_plan: string;
  status: string; // Should match enum values like 'default', 'survey', etc.
  area: string;
  region: string;
  brand: string;
  type_sio: string;
  brand_type_sio: string;
  amo_brand_type_sio: string;
  start_time: Date;
  end_time: Date;
  created_by?: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;
}

export class UpdateMdActivityDto {
  user_id?: number;
  code_outlet?: string;
  code_call_plan?: string;
  status?: string; // Optional for updates
  area?: string;
  region?: string;
  brand?: string;
  type_sio?: string;
  brand_type_sio?: string;
  amo_brand_type_sio?: string;
  start_time?: Date;
  end_time?: Date;
  updated_by?: string;
  updated_at?: Date;
}
