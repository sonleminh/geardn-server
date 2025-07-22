import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { FindStocksDto } from './dto/query-stock.dto';
import { ApiQuery } from '@nestjs/swagger';
import { JwtAdminAuthGuard } from '../admin-auth/guards/jwt-admin-auth.guard';

@Controller('stocks')
@UseGuards(JwtAdminAuthGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('')
  @ApiQuery({ type: FindStocksDto })
  findAll(@Query() query: FindStocksDto) {
    return this.stockService.findAll(query);
  }

  @Get(':id/products')
  findAllByProductId(@Param('id') id: string) {
    return this.stockService.findByProduct(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockService.remove(+id);
  }
}
