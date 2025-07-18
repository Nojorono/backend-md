export class CreateOutletDto {
  name?: string;
  brand?: string;
  address_line?: string;
  sub_district?: string;
  district?: string;
  latitude?: string;
  longitude?: string;
  outlet_code?: string;
  sio_type?: string;
  region?: string;
  area?: string;
  cycle?: string;
  is_active?: number;
  visit_day?: string;
  odd_even?: string;
  remarks?: string;
  survey_outlet_id?: number;
  range_health_facilities?: number;
  range_work_place?: number;
  range_public_transportation_facilities?: number;
  range_worship_facilities?: number;
  range_playground_facilities?: number;
  range_educational_facilities?: number;
  photos?: [];
  old_outlet_id?: number;
  on_survey_complete?: number;
  created_by?: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;
  deleted_by?: string;
  deleted_at?: Date;
}

export class UpdateOutletDto {
  name?: string;
  brand?: string;
  address_line?: string;
  sub_district?: string;
  district?: string;
  latitude?: string;
  longitude?: string;
  outlet_code?: string;
  outlet_type?: string;
  region?: string;
  area?: string;
  cycle?: string;
  is_active?: number;
  visit_day?: string;
  odd_even?: string;
  remarks?: string;
  survey_outlet_id?: number;
  range_health_facilities?: number;
  range_work_place?: number;
  range_public_transportation_facilities?: number;
  range_worship_facilities?: number;
  range_playground_facilities?: number;
  range_educational_facilities?: number;
  photos?: [];
  old_outlet_id?: number;
  on_survey_complete?: number;
  created_by?: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;
  deleted_by?: string;
  deleted_at?: Date;
}
