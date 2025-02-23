import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
  async addToCart(
    @Body() addToCartDto: AddToCartDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res,
  ) {
    return this.cartsService.addToCart(addToCartDto, req, res);
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

  @Delete('/remove-item/:id')
  async removeCartItem(@Param('id') id: number) {
    return this.cartsService.removeCartItem(id);
  }

  @Delete('clear-cart')
  async clearCartItems(@Req() req: Request) {
    return this.cartsService.clearCartItems(req);
  }
}
