import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProvinceService } from './province.service';

@Controller('province')
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  @Get()
  async getProvinceList() {
    return this.provinceService.getProvinceList();
  }

  @Get(':code')
  async getProvinceByCode(@Param('code', ParseIntPipe) code: number) {
    return this.provinceService.getProvinceByCode(code);
  }

  @Get('/d/:code')
  async getDistrictsByProvinceCode(@Param('code', ParseIntPipe) code: number) {
    return this.provinceService.getDistrictsByProvinceCode(code);
  }
}
