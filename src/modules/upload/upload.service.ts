import { BadRequestException, Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class UploadService {
  constructor(private readonly firebaseService: FirebaseService) {}
  async uploadImage(files: Array<Express.Multer.File>) {
    try {
      if (files.length === 0 || files.length > 3) {
        throw new BadRequestException('Please upload between 1 to 3 images');
      }
      const imageUrlList = await Promise.all(
        files.map((image) => this.firebaseService.uploadFile(image)),
      );
      return { data: imageUrlList };
    } catch (error) {
      throw error;
    }
  }
}
