import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { v4 as uuidv4 } from 'uuid';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { Response, Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { getCartTokenFromCookies } from 'src/utils/getCartToken';
import * as jwt from 'jsonwebtoken';
import { ILoginResponse } from 'src/interfaces/IUser';
import { getAccessTokenFromCookies } from 'src/utils/getAccessToken';

@Injectable()
export class CartsService {
  constructor(private prisma: PrismaService) {}
  async addToCart(addToCartDto: AddToCartDto, req: Request, res: Response) {
    const at = getAccessTokenFromCookies(req);
    const sessionId = getCartTokenFromCookies(req);
    let userData: ILoginResponse | null = null;
    if (at) {
      userData = jwt.verify(at, 'geardn') as ILoginResponse;
    }

    const { productId, skuId, quantity } = addToCartDto;
    let cart = await this.prisma.cart.findFirst({
      where: { OR: [{ userId: userData?.id }, { sessionId }] },
    });

    if (!cart && !userData?.id) {
      const sessionId = uuidv4();
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      cart = await this.prisma.cart.create({
        data: {
          sessionId,
        },
      });
    } else if (!cart && userData.id) {
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

    // if (!cart && userId) {

    // }
    return 'This action adds a new cart';
  }

  findAll() {
    return `This action returns all carts`;
  }

  async getCart(req: Request) {
    const cookies = req.headers?.cookie;
    const at = getAccessTokenFromCookies(req);
    const cartToken = getCartTokenFromCookies(req);
    console.log('ck:', cartToken);

    if (!at && !cartToken) {
      throw new NotFoundException('Không tìm thấy giỏ hàng!');
    }

    let userData: ILoginResponse | null = null;
    if (at) {
      userData = jwt.verify(at, 'geardn') as ILoginResponse;
      if (!userData) {
        throw new NotFoundException('Không tìm thấy giỏ hàng!');
      }
    }

    const cart = await this.prisma.cart.findFirst({
      where: {
        OR: [{ userId: userData?.id }, { sessionId: cartToken }],
      },
      include: {
        items: true
        // {
        //   include: {
        //     sku: true,
        //   },
        // },
      },
    });

    // console.log('cart:', userData);

    if (!cart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng!');
    }

    return { status: HttpStatus.OK, message: 'success', data: cart };

    // async getCart(sessionId: string | null, userId: number | null) {
    // return await this.prisma.cart.findFirst({
    //   where: { OR: [{ userId: userId }, { sessionId }] },
    //   include: {
    //     items: {
    //       include: {
    //         product: true,
    //         sku: true,
    //       },
    //     },
    //   }
    // });
  }

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}
