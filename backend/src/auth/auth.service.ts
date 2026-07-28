import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { SYSTEM_CATEGORIES } from '../categories/system-categories';
import { AuthUser, JwtPayload } from './types/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(email: string, password: string): Promise<AuthUser> {
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersService.create(email, passwordHash);

    await this.prisma.category.createMany({
      data: SYSTEM_CATEGORIES.map((category) => ({
        userId: user.id,
        name: category.name,
        description: category.description,
        slug: category.slug,
        isSystem: true,
      })),
    });

    return { userId: user.id, email: user.email };
  }

  async login(email: string, password: string): Promise<{ user: AuthUser; accessToken: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      user: { userId: user.id, email: user.email },
      accessToken,
    };
  }
}
