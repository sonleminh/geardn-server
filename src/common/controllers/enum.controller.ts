// src/common/controllers/enum.controller.ts
import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { EnumService } from '../services/enum.service';

@Controller('enums')
export class EnumController {
  constructor(private readonly enumService: EnumService) {}

  @Get(':context')
  getEnum(@Param('context') context: string) {
    const data = this.enumService.getEnumByContext(context);
    if (!data.length) {
      throw new NotFoundException(`Enum context '${context}' not found`);
    }
    return data;
  }

  @Get()
  getAllContexts() {
    return this.enumService.getAllContexts();
  }
}
