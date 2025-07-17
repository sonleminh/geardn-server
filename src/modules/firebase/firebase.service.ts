import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as fs from 'fs';


@Injectable()
export class FirebaseService {
  private storage: admin.storage.Storage;
  private serviceAccount: any;

  constructor(private configService: ConfigService) {
    const data = JSON.parse(fs.readFileSync('service_account.json', 'utf8'));
    this.serviceAccount = data;
    admin.initializeApp({
      credential: admin.credential.cert(this.serviceAccount),
      storageBucket: `${this?.serviceAccount?.project_id}.appspot.com`,
    });
    this.storage = admin.storage();
  }

  getStorageInstance(): admin.storage.Storage {
    return this.storage;
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const storage = this.getStorageInstance();
    const bucket = storage.bucket();
    const fileName = `${Date.now()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });
    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        reject(error);
      });

      stream.on('finish', async () => {
        try {
          // Đặt quyền công khai cho file
          await fileUpload.makePublic();
          // Lấy URL tải xuống
          const imageUrl = fileUpload.publicUrl();
          resolve(imageUrl);
        } catch (error) {
          reject(error);
        }
      });

      stream.end(file.buffer);
    });
  }

  async deleteFile(filePath: string) {
    const match = filePath.match(/(?:storage\.googleapis\.com\/.+\/)(.+)/);
    if (!match || match.length < 2) {
      throw new Error(`Invalid file path: ${filePath}`);
    }
    const relativePath = decodeURIComponent(match[1]);
    try {
      const storage = this.getStorageInstance();
      const bucket = storage.bucket();

      const result = await bucket.file(relativePath).delete();
      return result;
    } catch (error) {
      if (error.code === 404) {
        // File not found error code
        console.log(`File ${relativePath} not found, skipping deletion.`);
        return {
          success: false,
          message: `File ${relativePath} not found, skipping deletion.`,
        };
      }
      console.log('error:', error);
      throw new Error(`Failed to delete file ${filePath}`);
    }
  }
}
