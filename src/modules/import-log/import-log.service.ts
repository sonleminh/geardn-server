import { Injectable } from '@nestjs/common';
import { CreateImportLogDto } from './dto/create-import-log.dto';
import { UpdateImportLogDto } from './dto/update-import-log.dto';

@Injectable()
export class ImportLogService {
  create(createImportLogDto: CreateImportLogDto) {
    return 'This action adds a new importLog';
  }

  findAll() {
    return `This action returns all importLog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} importLog`;
  }

  update(id: number, updateImportLogDto: UpdateImportLogDto) {
    return `This action updates a #${id} importLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} importLog`;
  }
}
