export class CreateOutletDto {
  name?: string;
  unique_name?: string;
  brand?: string;
  address_line?: string;
  sub_district?: string;
  district?: string;
  city_or_regency?: string;
  postal_code?: number;
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
  photos?: [];
  created_by?: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;
  deleted_by?: string;
  deleted_at?: Date;
}

export class UpdateOutletDto {
  name?: string;
  unique_name?: string;
  brand?: string;
  address_line?: string;
  sub_district?: string;
  district?: string;
  city_or_regency?: string;
  postal_code?: number;
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
  photos?: [];
  created_by?: string;
  created_at?: Date;
  updated_by?: string;
  updated_at?: Date;
  deleted_by?: string;
  deleted_at?: Date;
}
