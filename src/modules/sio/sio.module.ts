import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { DrizzleService } from '../../common/services/drizzle.service';
import { UserRepo } from '../user/repository/user.repo';
import { SioRepository } from './repository/sio.repository';
import { SioService } from './service/sio.service';
import { SioControllers } from './controllers/sio.controllers';
import { SioGalleryRepository } from './repository/sio_gallery.repository';
import { SioGalleryService } from './service/sio_gallery.service';
import { SioGalleryControllers } from './controllers/sio_gallery.controllers';
import { S3Service } from '../s3/service/s3.service';

@Module({
  controllers: [SioControllers, SioGalleryControllers],
  imports: [CommonModule],
  providers: [
    DrizzleService,
    SioRepository,
    SioService,
    UserRepo,
    SioGalleryRepository,
    SioGalleryService,
    S3Service,
  ],
  exports: [SioRepository, SioService, SioGalleryRepository, SioGalleryService],
})
export class SioModule {}
