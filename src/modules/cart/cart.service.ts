import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

import { ILoginResponse } from 'src/interfaces/IUser';
import { getAccessTokenFromCookies } from 'src/utils/getAccessToken';

import { PrismaService } from '../prisma/prisma.service';

import { AddToCartDto } from './dto/add-to-cart.dto';
import { SyncCartItemsDto } from './dto/sync-cart.dto copy';
import { UpdateQuantityDto } from './dto/update-quantity.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}
  async addToCart(userId: number, dto: AddToCartDto) {
    const { productId, skuId, quantity } = dto;
    if (quantity <= 0) throw new ConflictException('QUANTITY_INVALID');

    return this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.upsert({
        where: { userId: userId ?? -1 },
        update: {},
        create: { userId },
        select: { id: true, userId: true },
      });

      const [stock] = await this.getStockForSkus([skuId]);
      const sku = await tx.productSKU.findUnique({
        where: { id: skuId },
        select: {
          id: true,
          product: { select: { id: true, name: true, status: true } },
        },
      });
      if (!sku) throw new ConflictException('SKU_NOT_FOUND');

      const existing = await tx.cartItem.findFirst({
        where: { cartId: cart.id, skuId },
        select: { id: true, quantity: true },
      });

      const nextQty = (existing?.quantity ?? 0) + quantity;
      const available = Number(stock?.quantity ?? 0);
      if (nextQty > available) {
        throw new ConflictException({
          code: 'CART_STOCK_EXCEEDED',
          message: 'Exceed the amount that can be added',
          context: { skuId, available, requested: nextQty },
        });
      }

      // 4) Tạo mới hoặc cập nhật
      const created = !existing;
      created
        ? await tx.cartItem.create({
            data: {
              cartId: cart.id,
              productId,
              skuId,
              quantity: nextQty,
            },
            select: { id: true, skuId: true, quantity: true },
          })
        : await tx.cartItem.update({
            where: { id: existing!.id },
            data: { quantity: nextQty },
            select: { id: true, skuId: true, quantity: true },
          });

      // 5) Lấy snapshot giỏ hàng sau cập nhật
      // const rawItems = await tx.cartItem.findMany({
      //   where: { cartId: cart.id },
      //   select: {
      //     id: true,
      //     productId: true,
      //     skuId: true,
      //     quantity: true,
      //     product: true,
      //   },
      //   orderBy: { id: 'asc' },
      // });

      // const items = rawItems.map((r) => {
      //   return {
      //     id: r.id,
      //     productId: r.productId,
      //     skuId: r.skuId,
      //     name: r.product?.name || '',
      //     imageUrl: r.product?.images[0] || null,
      //     quantity: r.quantity,
      //   };
      // });

      return {
        // cart: {
        //   id: cart.id,
        //   userId: cart.userId,
        //   items,
        // },
        message: 'Item added to cart successfully',
      };
    });
  }

  async updateQuantity(
    userId: number,
    id: number,
    updateQuantityDto: UpdateQuantityDto,
  ) {
    const { quantity } = updateQuantityDto;

    const cart = await this.prisma.cart.findFirst({
      where: { userId: userId },
    });

    if (!cart) throw new Error('Cart not found');

    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingItem) throw new Error('Item not found in cart');

    const stock = await this.getStockForSkus([existingItem.skuId]);

    if (quantity <= 0) {
      await this.removeCartItem(existingItem.id);
    } else if (quantity > stock[0].quantity) {
      throw new Error('Quantity exceeding inventory');
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

    return { message: 'Cart item quantity updated successfully' };
  }

  async syncCart(userId: number, syncCartItems: SyncCartItemsDto) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }
    if (syncCartItems.items.length) {
      for (const item of syncCartItems.items) {
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
                sellingPrice: true,
                imageUrl: true,
                // quantity: true,
                productSkuAttributes: {
                  select: {
                    id: true,
                    attributeValue: {
                      select: {
                        id: true,
                        attribute: {
                          select: {
                            name: true,
                          },
                        },
                        value: true,
                      },
                    },
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

  async syncCartReload(userId: number, syncCartItems: SyncCartItemsDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new Error('Cart not found');
    }
    if (syncCartItems.items.length) {
      for (const item of syncCartItems.items) {
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
                sellingPrice: true,
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
                sellingPrice: true,
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
    if (!skuIds || skuIds.length === 0) {
      return [] as { id: number; quantity: number }[];
    }

    const grouped = await this.prisma.stock.groupBy({
      by: ['skuId'],
      where: { skuId: { in: skuIds } },
      _sum: { quantity: true },
    });

    const quantityBySkuId = new Map<number, number>(
      grouped.map((g) => [g.skuId, g._sum.quantity ?? 0]),
    );

    return skuIds.map((id) => ({
      id,
      quantity: quantityBySkuId.get(id) ?? 0,
    }));
  }

  async removeCartItem(id: number) {
    return await this.prisma.cartItem.delete({
      where: { id: id },
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
