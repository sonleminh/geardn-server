import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(registerDTO: any) {
    // async createUser(registerDTO: RegisterDTO) {
    const checkExistUser = await this.prisma.user.findUnique({
      where: { email: registerDTO.email },
    });
    if (checkExistUser) {
      throw new HttpException(
        'User already exist',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new NotFoundException('User does not exist');
      }
      const compare = await bcrypt.compare(password, user.password);
      if (!compare) {
        throw new BadRequestException('Password is not correct');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }
}
