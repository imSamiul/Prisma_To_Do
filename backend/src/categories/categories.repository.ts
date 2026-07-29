import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { DEFAULT_CATEGORY_SLUG } from './system-categories';
import { idIn } from '../common/mongoose/id-query';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  findSystemCategories(userId: string): Promise<CategoryDocument[]> {
    return this.categoryModel.find({
      userId: idIn(userId),
      isSystem: true,
    });
  }

  insertMany(
    categories: Array<{
      userId: string;
      name: string;
      description?: string;
      slug?: string;
      isSystem: boolean;
    }>,
  ) {
    return this.categoryModel.insertMany(
      categories.map((category) => ({
        ...category,
        userId: new Types.ObjectId(category.userId),
      })),
    );
  }

  create(data: {
    userId: string;
    name: string;
    description?: string;
    isSystem: boolean;
  }): Promise<CategoryDocument> {
    return this.categoryModel.create({
      ...data,
      userId: new Types.ObjectId(data.userId),
    });
  }

  findByUserId(userId: string): Promise<CategoryDocument[]> {
    return this.categoryModel.find({ userId: idIn(userId) });
  }

  findDefaultCategory(userId: string): Promise<CategoryDocument | null> {
    return this.categoryModel.findOne({
      userId: idIn(userId),
      slug: DEFAULT_CATEGORY_SLUG,
      isSystem: true,
    });
  }

  findByIdForUser(
    id: string,
    userId: string,
  ): Promise<CategoryDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
      return Promise.resolve(null);
    }
    return this.categoryModel.findOne({
      _id: new Types.ObjectId(id),
      userId: idIn(userId),
    });
  }

  save(category: CategoryDocument): Promise<CategoryDocument> {
    return category.save();
  }

  async delete(category: CategoryDocument): Promise<void> {
    await category.deleteOne();
  }

  async normalizeUserIds(userId: string): Promise<void> {
    await this.categoryModel.collection.updateMany(
      { userId },
      { $set: { userId: new Types.ObjectId(userId) } },
    );
  }
}
