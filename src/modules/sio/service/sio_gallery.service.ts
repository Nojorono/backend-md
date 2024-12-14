import { Injectable } from '@nestjs/common';
import { UserRepo } from '../../user/repository/user.repo';
import { CreateSioGalleryDto, UpdateSioGalleryDto } from '../dtos/sio_gallery.dtos';
import { SioGalleryRepository } from '../repository/sio_gallery.repository';
import { S3Service } from 'src/modules/s3/service/s3.service';
@Injectable()
export class SioGalleryService {
  constructor(
    private readonly repository: SioGalleryRepository,
    private readonly userRepository: UserRepo,
    private readonly s3Service: S3Service,
  ) {}

  async createData(createDto: CreateSioGalleryDto, file: Express.Multer.File) {
    if(file) {
      const url = await this.s3Service.uploadCompressedImage('sio_component', file);
      createDto.photo = url;
    }
    return this.repository.create(createDto);
  }

  async getDataById(id: number) {
    return this.repository.getById(id);
  }

  async updateData(id: number, updateDto: UpdateSioGalleryDto, file: Express.Multer.File) {
    const data = await this.repository.getById(id);
    if(data.photo) {
      await this.s3Service.deleteImage(data.photo);
    }
    if(file) {
      const url = await this.s3Service.uploadCompressedImage('sio_component', file);
      updateDto.photo = url;
    }
    return this.repository.update(id, updateDto);
  }

  async deleteData(id: number, accessToken: string): Promise<void> {
    const user = await this.userRepository.findByToken(accessToken);
    return this.repository.delete(id, user.email);
  }

  async getAllActive(
    sioTypeId: number,
    page: number = 1,
    limit: number = 10,
    searchTerm: string = '',
  ) {
    return this.repository.getAllActive(sioTypeId, page, limit, searchTerm);
  }

  async getAll() {
    return this.repository.getAll();
  }
}
