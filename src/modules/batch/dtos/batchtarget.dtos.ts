export class CreateBatchTargetDto {
  batch_id?: number;
  regional?: string;
  amo?: string;
  brand_type_sio?: string;
  amo_brand_type?: string;
  allocation_ho?: number;
  created_by?: string;
  created_at?: Date;
  type_sio?: string;
}

export class UpdateBatchTargetDto {
  batch_id?: number;
  regional?: string;
  amo?: string;
  brand_type_sio?: string;
  amo_brand_type?: string;
  allocation_ho?: number;
  updated_by?: string;
  updated_at?: Date;
  deleted_at?: Date;
  deleted_by?: string;
}
