import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Todo, TodoDocument } from '../todos/schemas/todo.schema';
import {
  SYSTEM_CATEGORIES,
  SYSTEM_CATEGORY_NAMES,
  DEFAULT_CATEGORY_SLUG,
} from './system-categories';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Todo.name) private todoModel: Model<TodoDocument>,
  ) {}

  async ensureSystemCategories(userId: string): Promise<void> {
    const existing = await this.categoryModel
      .find({ userId, isSystem: true })
      .select('slug')
      .lean();
    const existingSlugs = new Set(
      existing.map((category) => category.slug).filter(Boolean),
    );

    const missing = SYSTEM_CATEGORIES.filter(
      (category) => !existingSlugs.has(category.slug),
    );

    if (missing.length === 0) return;

    await this.categoryModel.insertMany(
      missing.map((category) => ({
        userId,
        name: category.name,
        description: category.description,
        slug: category.slug,
        isSystem: true,
      })),
    );
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

    return this.categoryModel.create({
      userId,
      name: name.trim(),
      description,
      isSystem: false,
    });
  }

  async findByUserId(userId: string): Promise<CategoryDocument[]> {
    await this.ensureSystemCategories(userId);

    const categories = await this.categoryModel.find({ userId });

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
    const tasks = await this.categoryModel.findOne({
      userId,
      slug: DEFAULT_CATEGORY_SLUG,
      isSystem: true,
    });
    if (!tasks) {
      throw new NotFoundException('Default Tasks list not found');
    }
    return tasks;
  }

  async findByIdForUser(id: string, userId: string): Promise<CategoryDocument> {
    const category = Types.ObjectId.isValid(id)
      ? await this.categoryModel.findOne({ _id: id, userId })
      : null;
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

    return category.save();
  }

  async delete(id: string, userId: string): Promise<void> {
    const category = await this.findByIdForUser(id, userId);
    if (category.isSystem) {
      throw new ForbiddenException('Built-in lists cannot be deleted');
    }

    await this.todoModel.deleteMany({ categoryId: id, userId });
    await category.deleteOne();
  }
}
