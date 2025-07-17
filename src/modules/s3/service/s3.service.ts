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
    try {
      // Validate file input
      if (!file || !file.buffer) {
        throw new Error('Invalid file input');
      }

      // Convert buffer.data array to Buffer if needed
      const imageBuffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);

      // Compress the image using sharp
      const compressedImage = await sharp(imageBuffer)
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
        ACL: 'public-read', // Make the file publicly readable
        ContentType: 'image/jpeg',
      };

      const result = await this.s3.upload(params).promise();
      return result.Location;

    } catch (error) {
      console.error('Error processing/uploading image:', error);
      throw new Error(`Failed to process/upload image: ${error.message}`);
    }
  }

  // Method to delete an image from S3
  async deleteImage(key: string): Promise<string> {
    const bucketUrl =
      'https://nna-app-s3.s3.ap-southeast-3.amazonaws.com/';
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

  async uploadImageFlexible(input: Express.Multer.File | string, keyDirectory: string) {
    try {
      let buffer: Buffer;
      let originalName: string;

      // Handle different input types
      if (!input) {
        return null;
      }

      if (typeof input === 'object' && 'buffer' in input) {
        // Handle Multer file upload
        const file = input as Express.Multer.File;
        buffer = file.buffer;
        originalName = file.originalname;
      } else if (typeof input === 'string') {
        if (input.startsWith('data:image')) {
          // Handle base64 image data
          const base64Data = input.split(',')[1];
          buffer = Buffer.from(base64Data, 'base64');
          originalName = 'base64-image.jpg';
        } else if (input.startsWith('file://')) {
          // Handle local file URIs
          const filePath = input.replace('file://', '');
          const fileBuffer = require('fs').readFileSync(filePath);
          buffer = Buffer.from(fileBuffer);
          originalName = path.basename(filePath);
        } else {
          // Handle remote URLs
          const response = await fetch(input);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const blob = await response.blob();
          buffer = Buffer.from(await blob.arrayBuffer());
          originalName = input.split('/').pop() || 'unknown';
        }
      } else {
        throw new Error('Unsupported input type');
      }

      // Create a file object with the buffer and original name
      const file = {
        buffer,
        originalname: originalName,
      } as Express.Multer.File;

      // Upload the file using the compressed image method
      const imageUrl = await this.uploadCompressedImage(keyDirectory, file);
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }
}
