import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import path from 'path';
import sharp from 'sharp';

@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    // Access AWS configuration from the 'aws' namespace
    const awsConfig = this.configService.get('s3');

    this.s3 = new AWS.S3({
      region: awsConfig.region,
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey,
    });

    this.bucketName = awsConfig.s3BucketName;
  }

  // Generate a signed URL to access a private S3 object
  async generateSignedUrl(key: string): Promise<string> {
    const maxExpiration = 7 * 24 * 60 * 60; // 7 days in seconds

    const params = {
      Bucket: this.bucketName,
      Key: key,
      Expires: maxExpiration,
    };

    return this.s3.getSignedUrlPromise('getObject', params);
  }

  async uploadCompressedImage(
    keyDirectory: string,
    file: Express.Multer.File,
  ): Promise<string> {
    // Compress the image using sharp
    const compressedImage = await sharp(file.buffer)
      .resize(800) // Resize to max width of 800 pixels
      .jpeg({ quality: 80 }) // Set JPEG quality to 80%
      .toBuffer();

    // Generate the full key path
    const fileExtension = file.originalname.split('.').pop();
    const uniqueFileName = `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}.${fileExtension}`;
    const key = `${keyDirectory}/${uniqueFileName}`;

    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
      Body: compressedImage,
      ContentType: 'image/jpeg',
      ACL: 'public-read', // Make the file publicly readable
    };

    const result = await this.s3.upload(params).promise();
    return result.Location;
  }

  // Method to delete an image from S3
  async deleteImage(key: string): Promise<string> {
    const bucketUrl =
      'https://merchandise-nna.s3.ap-southeast-1.amazonaws.com/';
    const s3Key = key.replace(bucketUrl, '');
    const deleteParams = {
      Bucket: this.bucketName,
      Key: s3Key,
    };

    try {
      // Perform the delete operation
      await this.s3.deleteObject(deleteParams).promise();
      return `Image with key ${key} has been deleted successfully.`;
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  async uploadImageFromUri(uri: string, keyDirectory: string) {
    try {
        let arrayBuffer: ArrayBuffer;
        let originalName: string;

        if (uri.startsWith('file://')) {
            // Handle local file URIs
            const filePath = uri.replace('file://', '');
            const fileBuffer = require('fs').readFileSync(filePath);
            arrayBuffer = fileBuffer.buffer;
            originalName = path.basename(filePath);
        } else {
            // Handle remote URLs
            const response = await fetch(uri);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            arrayBuffer = await response.arrayBuffer();
            originalName = uri.split('/').pop() || 'unknown';
        }

        // Create a file object with the buffer and original name
        const file = {
            buffer: Buffer.from(arrayBuffer),
            originalname: originalName,
        } as Express.Multer.File;

        // Upload the file (assuming you have this method implemented)
        const imageUrl = await this.uploadCompressedImage(keyDirectory, file);
        return imageUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }
}
}
