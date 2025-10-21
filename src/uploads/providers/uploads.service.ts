import { Repository } from 'typeorm';
import { updateVehicleErrors } from './../../../node_modules/aws-sdk/clients/iotfleetwise.d';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Upload } from '../upload.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadToAwsProvider } from './upload-to-aws.provider';
import { ConfigService } from '@nestjs/config';
import { UploadFile } from '../interfaces/upload-file.interface';
import { fileTypes } from '../enums/file-types.enum';

@Injectable()
export class UploadsService {
  constructor(
    /*
     * Inject uploadToAwsProvider
     */
    public readonly uploadToAwsProvider: UploadToAwsProvider,

    /*
     * Inject configService
     */
    public readonly configService: ConfigService,

    /*
     * Inject uploadsRepository
     */
    @InjectRepository(Upload)
    private readonly uploadsReposity: Repository<Upload>,
  ) {}
  public async uploadFile(file: Express.Multer.File) {
    // throw error for unsupported file types
    if (
      !['image/jpg', 'image/jpeg', 'image/png', 'image/gif'].includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException('Unsupported file type');
    }

    try {
      // Upload the file to AWS S3
      const name = await this.uploadToAwsProvider.fileUpload(file);
      // Generate to a new entry in database
      const uploadFile: UploadFile = {
        name,
        path: `https://${this.configService.get('appConfig.awsCloudfrontUrl')}/${name}`,
        type: fileTypes.IMAGE,
        mime: file.mimetype,
        size: file.size,
      };

      const upload = this.uploadsReposity.create(uploadFile);
      await this.uploadsReposity.save(upload);
      return upload;
    } catch (error) {
      throw new ConflictException(error);
    }
  }
}
