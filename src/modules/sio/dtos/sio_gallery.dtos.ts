export class CreateSioGalleryDto {
  name: string;
  photo: string;
  sio_type_id: number;
}

export class UpdateSioGalleryDto {
  id: number;
  name: string;
  photo: string;
}