import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(registerDTO: CreateUserDto) {
    const checkExistUser = await this.prisma.user.findUnique({
      where: { email: registerDTO.email },
    });
    if (checkExistUser) {
      throw new HttpException('User already exist', HttpStatus.CONFLICT);
    }
    const { password, ...rest } = registerDTO;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const data = { password: hashedPassword, ...rest };
    const user = await this.prisma.user.create({ data });
    const { password: userPassword, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // async findOneByEmail(email: string) {
  //   return this.prisma.user
  //     .fff((user) => user.email === email)
  //     .lean()
  //     .exec();
  // }

  // async getUserById(id: number) {
  //   try {
  //     const user = await this.userModel.findById(id);
  //     if (!user) {
  //       throw new NotFoundException();
  //     }
  //     return user;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async findAndVerify(authCredentialsDto: { email: string; password: string }) {
    try {
      const { email, password } = authCredentialsDto;
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          role: true,
        },
      });
      if (!user) {
        throw new UnauthorizedException('Invalid user or password');
      }
      const compare = await bcrypt.compare(password, user.password);
      if (!compare) {
        throw new UnauthorizedException('Invalid user or password');
      }
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number) {
    const res = await this.prisma.user.findUnique({ where: { id } });
    if (!res) {
      throw new NotFoundException('Cannot find user!');
    }
    return { data: res };
  }

  async upsertGoogleUser(payload: {
    googleId: string;
    email: string;
    name: string;
  }) {
    const byGoogle = await this.prisma.user.findUnique({
      where: { googleId: payload.googleId },
    });
    if (byGoogle) {
      return this.prisma.user.update({
        where: { id: byGoogle.id },
        select: { id: true, name: true, email: true, role: true },
        data: {
          name: payload.name ?? byGoogle.name,
          provider: 'GOOGLE',
          updatedAt: new Date(),
        },
      });
    }
    const byEmail = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (byEmail) {
      return this.prisma.user.update({
        where: { id: byEmail.id },
        select: { id: true, name: true, email: true, role: true },
        data: {
          googleId: payload.googleId,
          provider: 'GOOGLE',
          name: payload.name ?? byEmail.name,
          updatedAt: new Date(),
        },
      });
    }
    return this.prisma.user.create({
      select: { id: true, name: true, email: true, role: true },
      data: {
        email: payload.email,
        googleId: payload.googleId,
        name: payload.name ?? '',
        provider: 'GOOGLE',
      },
    });
  }
}
