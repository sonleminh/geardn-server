import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
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

  @Get('stocks')
  async getCartStock(
    @Query(
      'skuIds',
      new ParseArrayPipe({ items: Number, separator: ',', optional: false }),
    )
    skuIds: number[],
  ) {
    if (!skuIds?.length) throw new BadRequestException('skuIds required');
    const ids = Array.from(
      new Set(skuIds.filter((n) => Number.isInteger(n) && n > 0)),
    );
    if (!ids.length) throw new BadRequestException('invalid skuIds');
    if (ids.length > 100) throw new BadRequestException('too many skuIds');
    return this.cartService.getStockForSkus(ids);
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
