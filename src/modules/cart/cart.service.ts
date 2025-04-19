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
export class CartService {
  constructor(private prisma: PrismaService) {}
  async addToCart(userId: number, addToCartDto: AddToCartDto) {
    const { productId, skuId, quantity } = addToCartDto;

    let cart = await this.prisma.cart.findUnique({
      where: { userId: userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId: userId,
        },
      });
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        skuId: skuId,
      },
    });

    const sku = await this.prisma.productSKU.findUnique({
      where: { id: skuId },
    });

    // if (existingItem?.quantity + quantity > sku?.quantity) {
    //   throw new Error('Exceed the amount that can be added');
    // }

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

  async updateQuantity(userId: number, updateQuantityDto: UpdateQuantityDto) {
    const { skuId, quantity } = updateQuantityDto;

    const cart = await this.prisma.cart.findFirst({
      where: { userId: userId },
    });

    if (!cart) throw new Error('Cart not found');

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        skuId: skuId,
      },
    });

    if (!existingItem) throw new Error('Item not found in cart');

    const sku = await this.prisma.productSKU.findUnique({
      where: { id: skuId },
    });

    // if (quantity > sku?.quantity) {
    //   throw new Error('Exceed the amount that can be added');
    // }

    if (quantity <= 0) {
      await this.removeCartItem(existingItem.id);
    } else {
      await this.prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: quantity,
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
    if (syncCartItems.length) {
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
          await this.prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
              quantity:
                item.quantity <= existingItem.quantity
                  ? existingItem.quantity
                  : item.quantity,
            },
          });
        } else {
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
                // quantity: true,
                productSkuAttributes: {
                  select: {
                    id: true,
                    attributeValue: true,
                    // {
                    //   select: {
                    //     id: true,
                    //     type: true,
                    //     value: true,
                    //   },
                    // },
                  },
                },
              },
            },
          },
        },
        user: true,
      },
    });

    return { message: 'Cart synced successfully', data: updatedCart };
  }

  async syncCartReload(userId: number, syncCartItems: SyncCartItemsDto[]) {
    console.log('syncCartReload');
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new Error('Cart not found');
    }
    if (syncCartItems.length) {
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
          await this.prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: existingItem.quantity,
            },
          });
        } else {
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
                // quantity: true,
                productSkuAttributes: {
                  select: {
                    id: true,
                    attributeValue: true,
                    // {
                    //   select: {
                    //     id: true,
                    //     type: true,
                    //     value: true,
                    //   },
                    // },
                  },
                },
              },
            },
          },
        },
        user: true,
      },
    });

    return { message: 'Cart synced successfully', data: updatedCart };
  }

  async getCart(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId: userId },
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
                // quantity: true,
                productSkuAttributes: {
                  select: {
                    id: true,
                    attributeValue: true,
                    // {
                    //   select: {
                    //     id: true,
                    //     type: true,
                    //     value: true,
                    //   },
                    // },
                  },
                },
              },
            },
          },
        },
        user: true,
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
      // select: { id: true, quantity: true },
      select: { id: true },
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
