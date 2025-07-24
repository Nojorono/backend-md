import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { S3Service } from './service/s3.service';
import { S3Controller } from './controllers/s3.controller';

@Module({
  controllers: [S3Controller],
  imports: [CommonModule],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
