import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body, Get, Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../service/s3.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Images') // Tag for Swagger grouping
@Controller('images')
export class S3Controller {
  constructor(private readonly s3ImageService: S3Service) {}
  @ApiBearerAuth('accessToken')
  @Post('upload')
  @ApiOperation({ summary: 'Upload an image to S3' })
  @ApiConsumes('multipart/form-data') // Specify the content type for file upload
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary', // Specify file format for Swagger
        },
        keyDirectory: {
          type: 'string',
          description: 'Directory path in S3 to save the file',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('keyDirectory') keyDirectory: string,
  ) {
    const fileUrl = await this.s3ImageService.uploadCompressedImage(
      keyDirectory,
      file,
    );
    return { url: fileUrl };
  }

  // Endpoint for generating a signed URL to access the image
  @ApiBearerAuth('accessToken')
  @Get('signed-url')
  @ApiOperation({ summary: 'Get a signed URL for accessing an image' })
  async getSignedUrl(@Query('key') key: string) {
    if (!key) {
      return { error: 'Key parameter is required' };
    }
    const signedUrl = await this.s3ImageService.generateSignedUrl(key);
    return { url: signedUrl };
  }
}