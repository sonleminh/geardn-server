import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { FindStocksDto } from './dto/query-stock.dto';
import { ApiQuery } from '@nestjs/swagger';

@Controller('stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  create(@Body() createStockDto: CreateStockDto) {
    return this.stockService.create(createStockDto);
  }

  @Get()
  findAll() {
    return this.stockService.findAll();
  }

  @Get(':id/warehouses')
  @ApiQuery({ type: FindStocksDto })
  findAllByWarehouseId(@Param('id') id: string, @Query() query: FindStocksDto) {
    return this.stockService.findByWarehouse(+id, query);
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
