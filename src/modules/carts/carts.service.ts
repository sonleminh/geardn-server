import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { ILoginResponse } from 'src/interfaces/IUser';
import { getAccessTokenFromCookies } from 'src/utils/getAccessToken';
import { getCartTokenFromCookies } from 'src/utils/getCartToken';

import { PrismaService } from '../prisma/prisma.service';

import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateQuantityDto } from './dto/update-quantity.dto';

@Injectable()
export class CartsService {
  constructor(private prisma: PrismaService) {}
  async addToCart(addToCartDto: AddToCartDto, req: Request) {
    const at = getAccessTokenFromCookies(req);
    console.log('addToCartDto', addToCartDto);
    let userData: ILoginResponse | null = null;
    if (at) {
      userData = jwt.verify(at, 'geardn') as ILoginResponse;
    }

    const { productId, skuId, quantity } = addToCartDto;
    let cart = await this.prisma.cart.findFirst({
      where: { userId: userData?.id },
    });

    if (!cart && userData.id) {
      cart = await this.prisma.cart.create({
        data: {
          userId: userData.id,
        },
      });
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        skuId,
      },
    });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: {
          id: existingItem?.id,
        },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });
    } else {
      return await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          skuId: skuId,
          quantity: quantity,
        },
      });
    }
  }

  async updateQuantity(updateQuantityDto: UpdateQuantityDto, req: Request) {
    const at = getAccessTokenFromCookies(req);

    let userData: ILoginResponse | null = null;
    if (at) {
      userData = jwt.verify(at, 'geardn') as ILoginResponse;
    }

    const cart = await this.prisma.cart.findFirst({
      where: { userId: userData?.id },
    });

    if (!cart) throw new Error('Cart not found');

    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        skuId: updateQuantityDto.skuId,
      },
    });

    if (!cartItem) throw new Error('Item not found in cart');

    if (updateQuantityDto.quantity <= 0) {
      await this.prisma.cartItem.delete({
        where: {
          id: cartItem.id,
        },
      });
    } else {
      await this.prisma.cartItem.update({
        where: {
          id: cartItem.id,
        },
        data: {
          quantity: updateQuantityDto.quantity,
        },
      });
    }

    return this.prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: true },
    });
  }

  async getCart(req: Request) {
    const at = getAccessTokenFromCookies(req);
    const cartToken = getCartTokenFromCookies(req);

    if (!at && !cartToken) {
      throw new NotFoundException('Cart not found!');
    }

    let userData: ILoginResponse | null = null;
    if (at) {
      userData = jwt.verify(at, 'geardn') as ILoginResponse;
      if (!userData) {
        throw new NotFoundException('Cart not found!');
      }
    }

    const cart = await this.prisma.cart.findFirst({
      where: {
        userId: userData?.id,
      },
      include: {
        items: true,
        user: true,
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found!');
    }
    return { data: cart };
  }

  async removeCartItem(cartItemId: number) {
    return await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  async clearCartItems(req: Request) {
    const at = getAccessTokenFromCookies(req);

    let userData: ILoginResponse | null = null;
    if (at) {
      userData = jwt.verify(at, 'geardn') as ILoginResponse;
    }

    const cart = await this.prisma.cart.findFirst({
      where: { userId: userData?.id },
    });
    console.log('cart', cart);
    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart?.id,
      },
    });

    return { message: 'All cart items removed!' };
  }
}
