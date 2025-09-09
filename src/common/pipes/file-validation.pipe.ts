import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Express } from 'express';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File) {
    if (!value) {
      throw new BadRequestException('No file uploaded.');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedMimeTypes.includes(value.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.');
    }
    
    return value;
  }
}