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
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { CartsService } from './carts.service';

import { UpdateQuantityDto } from './dto/update-quantity.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add')
  async addToCart(@Req() req: Request, @Body() addToCartDto: AddToCartDto) {
    const userId = req.user?.id;
    return this.cartsService.addToCart(userId, addToCartDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-quantity')
  async updateQuantity(
    @Req() req: Request,
    @Body() updateQuantityDto: UpdateQuantityDto,
  ) {
    const userId = req.user?.id;
    return this.cartsService.updateQuantity(userId, updateQuantityDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync')
  async syncCart(@Req() req: Request, @Body() cart) {
    const userId = req.user?.id;
    return this.cartsService.syncCart(userId, cart);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync-reload')
  async syncCartReload(@Req() req: Request, @Body() cart) {
    const userId = req.user?.id;
    return this.cartsService.syncCartReload(userId, cart);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  getCart(@Req() req: Request) {
    const userId = req.user?.id;
    return this.cartsService.getCart(userId);
  }

  @Get('stock')
  async getCartStock(@Query('skuIds') skuIds: string) {
    const skuIdArray = skuIds.split(',').map(Number);
    return this.cartsService.getStockForSkus(skuIdArray);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/remove-item/:id')
  async removeCartItem(@Param('id') id: number) {
    return this.cartsService.removeCartItem(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('clear-cart')
  async clearCartItems(@Req() req: Request) {
    return this.cartsService.clearCartItems(req);
  }
}
