export class CreateProgramDto {
  name?: string;
  description?: string;
  notes?: string;
  created_by?: string;
  created_at?: Date;
}

export class UpdateProgramDto {
  name?: string;
  description?: string;
  notes?: string;
  updated_by?: string;
  updated_at?: Date;
}
