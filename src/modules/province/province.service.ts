import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ProvinceService {
  private readonly API_URL = 'https://provinces.open-api.vn/api';

  async getProvinceList() {
    try {
      const response = await axios.get(`${this.API_URL}/`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch provinces: ${error.message}`);
    }
  }

  async getProvinceByCode(code: number) {
    try {
      const response = await axios.get(`${this.API_URL}/p/${code}?depth=2`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch province: ${error.message}`);
    }
  }

  async getDistrictsByProvinceCode(districtCode: number) {
    try {
      const response = await axios.get(
        `${this.API_URL}/d/${districtCode}?depth=2`,
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch districts: ${error.message}`);
    }
  }
}
