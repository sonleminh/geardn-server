import {
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import {  FilesInterceptor } from '@nestjs/platform-express';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @UseInterceptors(FilesInterceptor('images'))
  @Post('/')
  async uploadImage(@UploadedFiles() images: Array<Express.Multer.File>) {
    return this.uploadService.uploadImage(images);
  }}
