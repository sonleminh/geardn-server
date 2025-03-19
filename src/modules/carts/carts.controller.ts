import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { Request } from 'express';

import { CartsService } from './carts.service';

import { UpdateQuantityDto } from './dto/update-quantity.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post('add')
  async addToCart(@Req() req: Request, @Body() addToCartDto: AddToCartDto) {
    return this.cartsService.addToCart(req, addToCartDto);
  }

  @Post('update-quantity')
  async updateQuantity(
    @Req() req: Request,
    @Body() updateQuantityDto: UpdateQuantityDto,
  ) {
    return this.cartsService.updateQuantity(req, updateQuantityDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync')
  async syncCart(@Req() req: Request, @Body() cart) {
    const userId = req.user?.id;
    return this.cartsService.syncCart(userId, cart);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  getCart(@Req() req: Request) {
    const userId = req.user?.id;
    return this.cartsService.getCart(userId);
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
