import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  SYSTEM_CATEGORIES,
  SYSTEM_CATEGORY_NAMES,
  DEFAULT_CATEGORY_SLUG,
} from './system-categories';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async ensureSystemCategories(userId: string): Promise<void> {
    const existing = await this.prisma.category.findMany({
      where: { userId, isSystem: true },
      select: { slug: true },
    });
    const existingSlugs = new Set(
      existing.map((category) => category.slug).filter(Boolean),
    );

    const missing = SYSTEM_CATEGORIES.filter(
      (category) => !existingSlugs.has(category.slug),
    );

    if (missing.length === 0) return;

    await this.prisma.category.createMany({
      data: missing.map((category) => ({
        userId,
        name: category.name,
        description: category.description,
        slug: category.slug,
        isSystem: true,
      })),
    });
  }

  async create(
    userId: string,
    name: string,
    description?: string,
  ): Promise<Category> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    if (SYSTEM_CATEGORY_NAMES.includes(name.trim().toLowerCase())) {
      throw new BadRequestException(
        `"${name}" is a built-in list and cannot be created again`,
      );
    }

    return this.prisma.category.create({
      data: {
        userId,
        name: name.trim(),
        description,
        isSystem: false,
      },
    });
  }

  async findByUserId(userId: string): Promise<Category[]> {
    await this.ensureSystemCategories(userId);

    const categories = await this.prisma.category.findMany({
      where: { userId },
    });

    const systemOrder = SYSTEM_CATEGORIES.map((category) => category.slug);
    const system = systemOrder
      .map((slug) => categories.find((category) => category.slug === slug))
      .filter((category): category is Category => Boolean(category));

    const custom = categories
      .filter((category) => !category.isSystem)
      .sort((a, b) => a.name.localeCompare(b.name));

    return [...system, ...custom];
  }

  async getDefaultCategory(userId: string): Promise<Category> {
    await this.ensureSystemCategories(userId);
    const tasks = await this.prisma.category.findFirst({
      where: { userId, slug: DEFAULT_CATEGORY_SLUG, isSystem: true },
    });
    if (!tasks) {
      throw new NotFoundException('Default Tasks list not found');
    }
    return tasks;
  }

  async findByIdForUser(id: string, userId: string): Promise<Category> {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Pick<Category, 'name' | 'description'>>,
  ): Promise<Category> {
    const category = await this.findByIdForUser(id, userId);
    if (category.isSystem) {
      throw new ForbiddenException('Built-in lists cannot be edited');
    }

    if (
      data.name &&
      SYSTEM_CATEGORY_NAMES.includes(data.name.trim().toLowerCase())
    ) {
      throw new BadRequestException(
        `"${data.name}" is reserved for a built-in list`,
      );
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
      },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    const category = await this.findByIdForUser(id, userId);
    if (category.isSystem) {
      throw new ForbiddenException('Built-in lists cannot be deleted');
    }

    await this.prisma.todo.deleteMany({ where: { categoryId: id, userId } });
    await this.prisma.category.delete({ where: { id } });
  }
}
