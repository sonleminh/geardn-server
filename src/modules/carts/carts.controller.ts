import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res
} from '@nestjs/common';
import { Request } from 'express';

import { CartsService } from './carts.service';

import { UpdateQuantityDto } from './dto/update-quantity.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post('add')
  async addToCart(@Body() addToCartDto: AddToCartDto, @Req() req: Request) {
    return this.cartsService.addToCart(addToCartDto, req);
  }

  @Post('update-quantity')
  async updateQuantity(
    @Body() updateQuantityDto: UpdateQuantityDto,
    @Req() req: Request,
  ) {
    return this.cartsService.updateQuantity(updateQuantityDto, req);
  }

  @Get('')
  getCart(@Req() req: Request) {
    return this.cartsService.getCart(req);
  }

  @Get('stock')
  async getCartStock(@Query('skuIds') skuIds: string) {
    const skuIdArray = skuIds.split(',').map(Number)
    return this.cartsService.getStockForSkus(skuIdArray)
  }

  @Delete('/remove-item/:id')
  async removeCartItem(@Param('id') id: number) {
    return this.cartsService.removeCartItem(id);
  }

  @Delete('clear-cart')
  async clearCartItems(@Req() req: Request) {
    return this.cartsService.clearCartItems(req);
  }
}
