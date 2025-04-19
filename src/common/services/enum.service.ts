import { Injectable } from '@nestjs/common';
import { ENUM_LABELS } from '../constants/enum-labels';

@Injectable()
export class EnumService {
  getEnumByContext(context: string) {
    return ENUM_LABELS[context] || [];
  }

  getAllContexts() {
    return Object.keys(ENUM_LABELS);
  }
}
