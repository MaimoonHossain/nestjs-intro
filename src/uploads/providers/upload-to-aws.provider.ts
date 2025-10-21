import { Content } from './../../../node_modules/aws-sdk/clients/chime.d';
import { Injectable, RequestTimeoutException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadToAwsProvider {
  constructor(
    /*
     * Inject configService
     */
    private readonly configService: ConfigService,
  ) {}

  public async fileUpload(file: Express.Multer.File) {
    // Upload the file to AWS S3
    const s3 = new S3();

    try {
      const uploadResult = await s3
        .upload({
          Bucket: this.configService.get('appConfig.awsBucketName'),
          Body: file.buffer,
          Key: this.generateFileName(file),
          ContentType: file.mimetype,
        })
        .promise();

      return uploadResult.Key;
    } catch (error) {
      throw new RequestTimeoutException(error);
    }
  }

  private generateFileName(file: Express.Multer.File) {
    // Extract file name
    let name = file.originalname.split('.')[0];
    // Remove white spaces
    name.replace(/\s/g, '').trim();
    // Extract the extension
    let extension = path.extname(file.originalname);
    // Generate time stamp
    let timestamp = new Date().getTime().toString().trim();
    // Return fiel uuid
    return `${name}-${timestamp}-${uuidv4()}${extension}`;
  }
}
