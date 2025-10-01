import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { CartService } from './cart.service';

import { UpdateQuantityDto } from './dto/update-quantity.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtAuthGuard)
  @Post('items')
  async addToCart(@Req() req: Request, @Body() addToCartDto: AddToCartDto) {
    const userId = req.user?.id;
    return this.cartService.addToCart(userId, addToCartDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('items/:id')
  async updateQty(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuantityDto: UpdateQuantityDto,
  ) {
    const userId = req.user?.id;
    return this.cartService.updateQuantity(userId, id, updateQuantityDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync')
  async syncCart(@Req() req: Request, @Body() cart) {
    const userId = req.user?.id;
    return this.cartService.syncCart(userId, cart);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sync-reload')
  async syncCartReload(@Req() req: Request, @Body() cart) {
    const userId = req.user?.id;
    return this.cartService.syncCartReload(userId, cart);
  }

  @UseGuards(JwtAuthGuard)
  @Get('')
  getCart(@Req() req: Request) {
    const userId = req.user?.id;
    return this.cartService.getCart(userId);
  }

  @Get('stock')
  async getCartStock(@Query('skuIds') skuIds: string) {
    const skuIdArray = skuIds.split(',').map(Number);
    return this.cartService.getStockForSkus(skuIdArray);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/items/:id')
  async removeCartItem(@Param('id', ParseIntPipe) id: number) {
    return this.cartService.removeCartItem(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('clear-cart')
  async clearCartItems(@Req() req: Request) {
    return this.cartService.clearCartItems(req);
  }
}
