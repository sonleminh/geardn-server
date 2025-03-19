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
import { SyncCartItemsDto } from './dto/sync-cart.dto copy';

@Injectable()
export class CartsService {
  constructor(private prisma: PrismaService) {}
  async addToCart(req: Request, addToCartDto: AddToCartDto) {
    const at = getAccessTokenFromCookies(req);
    let userData: ILoginResponse | null = null;

    if (at) {
      userData = jwt.verify(at, 'geardn') as ILoginResponse;
    }
    const { productId, skuId, quantity } = addToCartDto;

    if (!userData?.id) {
      throw new Error('User not found');
    }

    let cart = await this.prisma.cart.findUnique({
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

  async updateQuantity(req: Request, updateQuantityDto: UpdateQuantityDto) {
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

  async syncCart(userId: number, syncCartItems: SyncCartItemsDto[]) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    // const newCart = await this.prisma.cart.upsert({
    //   where: { userId },
    //   update: { items: cart },
    //   create: { userId, items: cart },
    // });

    for (const item of syncCartItems) {
      const existingItem = await this.prisma.cartItem.findUnique({
        where: {
          cartId_productId_skuId: {
            cartId: cart.id,
            productId: item.productId,
            skuId: item.skuId,
          },
        },
      });

      if (existingItem) {
        // 🟢 Cộng dồn số lượng nếu sản phẩm đã có
        await this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: item.quantity },
        });
      } else {
        // 🟢 Nếu chưa có, thêm mới
        await this.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            skuId: item.skuId,
            quantity: item.quantity,
          },
        });
      }
    }

    const updatedCart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            product: {
              select: {
                name: true,
                images: true,
              },
            },
            sku: {
              select: {
                id: true,
                sku: true,
                price: true,
                imageUrl: true,
                quantity: true,
                productSkuAttributes: {
                  select: {
                    id: true,
                    attribute: {
                      select: {
                        type: true,
                        value: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        user: true,
      },
    })

    return { message: 'Cart synced successfully', data: updatedCart };
  }

  async getCart(userId?: number) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            quantity: true,
            product: {
              select: {
                name: true,
                images: true,
              },
            },
            sku: {
              select: {
                id: true,
                sku: true,
                price: true,
                imageUrl: true,
                quantity: true,
                productSkuAttributes: {
                  select: {
                    id: true,
                    attribute: {
                      select: {
                        id: true,
                        type: true,
                        value: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found!');
    }
    return { data: cart };
  }

  async getStockForSkus(skuIds: number[]) {
    return await this.prisma.productSKU.findMany({
      where: { id: { in: skuIds } },
      select: { id: true, quantity: true },
    });
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
    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart?.id,
      },
    });

    return { message: 'All cart items removed!' };
  }
}
