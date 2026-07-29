import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CategoriesRepository } from './categories.repository';
import { TodosRepository } from '../todos/todos.repository';
import {
  SYSTEM_CATEGORIES,
  SYSTEM_CATEGORY_NAMES,
} from './system-categories';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    @Inject(forwardRef(() => TodosRepository))
    private readonly todosRepository: TodosRepository,
  ) {}

  async ensureSystemCategories(userId: string): Promise<void> {
    await this.reconcileDuplicateSystemCategories(userId);

    const existing = await this.categoriesRepository.findSystemCategories(
      userId,
    );
    const existingSlugs = new Set(
      existing.map((category) => category.slug).filter(Boolean),
    );

    const missing = SYSTEM_CATEGORIES.filter(
      (category) => !existingSlugs.has(category.slug),
    );

    if (missing.length === 0) return;

    await this.categoriesRepository.insertMany(
      missing.map((category) => ({
        userId,
        name: category.name,
        description: category.description,
        slug: category.slug,
        isSystem: true,
      })),
    );
  }

  /**
   * Older writes stored userId as string and created duplicate system lists.
   * Keep one canonical list per slug, move todos onto it, delete the rest.
   */
  private async reconcileDuplicateSystemCategories(
    userId: string,
  ): Promise<void> {
    const systemCategories =
      await this.categoriesRepository.findSystemCategories(userId);

    for (const system of SYSTEM_CATEGORIES) {
      const duplicates = systemCategories.filter(
        (category) => category.slug === system.slug,
      );
      if (duplicates.length <= 1) continue;

      duplicates.sort((a, b) => {
        const aIsObjectId = a.userId instanceof Types.ObjectId;
        const bIsObjectId = b.userId instanceof Types.ObjectId;
        if (aIsObjectId !== bIsObjectId) {
          return aIsObjectId ? -1 : 1;
        }
        return (
          a._id.getTimestamp().getTime() - b._id.getTimestamp().getTime()
        );
      });

      const [canonical, ...extras] = duplicates;
      for (const duplicate of extras) {
        await this.todosRepository.reassignCategory(
          String(duplicate._id),
          String(canonical._id),
          userId,
        );
        await this.categoriesRepository.delete(duplicate);
      }
    }

    await this.categoriesRepository.normalizeUserIds(userId);
    await this.todosRepository.normalizeUserIds(userId);
  }

  async create(
    userId: string,
    name: string,
    description?: string,
  ): Promise<CategoryDocument> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    if (SYSTEM_CATEGORY_NAMES.includes(name.trim().toLowerCase())) {
      throw new BadRequestException(
        `"${name}" is a built-in list and cannot be created again`,
      );
    }

    return this.categoriesRepository.create({
      userId,
      name: name.trim(),
      description,
      isSystem: false,
    });
  }

  async findByUserId(userId: string): Promise<CategoryDocument[]> {
    await this.ensureSystemCategories(userId);

    const categories = await this.categoriesRepository.findByUserId(userId);

    const systemOrder = SYSTEM_CATEGORIES.map((category) => category.slug);
    const system: CategoryDocument[] = [];
    for (const slug of systemOrder) {
      const match = categories.find((category) => category.slug === slug);
      if (match) system.push(match);
    }

    const custom = categories
      .filter((category) => !category.isSystem)
      .sort((a, b) => a.name.localeCompare(b.name));

    return [...system, ...custom];
  }

  async getDefaultCategory(userId: string): Promise<CategoryDocument> {
    await this.ensureSystemCategories(userId);
    const tasks = await this.categoriesRepository.findDefaultCategory(userId);
    if (!tasks) {
      throw new NotFoundException('Default Tasks list not found');
    }
    return tasks;
  }

  async findByIdForUser(id: string, userId: string): Promise<CategoryDocument> {
    const category = await this.categoriesRepository.findByIdForUser(
      id,
      userId,
    );
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Pick<Category, 'name' | 'description'>>,
  ): Promise<CategoryDocument> {
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

    if (data.name !== undefined) {
      category.name = data.name.trim();
    }
    if (data.description !== undefined) {
      category.description = data.description;
    }

    return this.categoriesRepository.save(category);
  }

  async delete(id: string, userId: string): Promise<void> {
    const category = await this.findByIdForUser(id, userId);
    if (category.isSystem) {
      throw new ForbiddenException('Built-in lists cannot be deleted');
    }

    await this.todosRepository.deleteManyByCategory(id, userId);
    await this.categoriesRepository.delete(category);
  }
}
