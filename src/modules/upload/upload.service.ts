import { BadRequestException, Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class UploadService {
  constructor(private readonly firebaseService: FirebaseService) {}
  async uploadImage(images: Array<Express.Multer.File>) {
    try {
      if (images.length === 0 || images.length > 3) {
        throw new BadRequestException('Please upload between 1 to 3 images');
      }
      const imageUrlList = await Promise.all(
        images.map((image) => this.firebaseService.uploadFile(image)),
      );
      return { images: imageUrlList };
    } catch (error) {
      throw error;
    }
  }
}
