import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';
import { idIn } from '../common/mongoose/id-query';

@Injectable()
export class TodosRepository {
  constructor(
    @InjectModel(Todo.name) private readonly todoModel: Model<TodoDocument>,
  ) {}

  create(data: {
    userId: string;
    categoryId: string;
    title: string;
    description?: string;
    inMyDay?: boolean;
  }): Promise<TodoDocument> {
    return this.todoModel.create({
      title: data.title,
      description: data.description,
      inMyDay: data.inMyDay,
      userId: new Types.ObjectId(data.userId),
      categoryId: new Types.ObjectId(data.categoryId),
    });
  }

  findByUserId(
    userId: string,
    filter?: { categoryId?: string; inMyDay?: boolean },
  ): Promise<TodoDocument[]> {
    const query: FilterQuery<TodoDocument> = {
      userId: idIn(userId),
    };

    if (filter?.inMyDay !== undefined) {
      query.inMyDay = filter.inMyDay;
    }

    if (filter?.categoryId) {
      query.categoryId = idIn(filter.categoryId);
    }

    return this.todoModel.find(query).sort({ createdAt: -1 });
  }

  findByIdForUser(
    id: string,
    userId: string,
  ): Promise<TodoDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) {
      return Promise.resolve(null);
    }
    return this.todoModel.findOne({
      _id: new Types.ObjectId(id),
      userId: idIn(userId),
    });
  }

  save(todo: TodoDocument): Promise<TodoDocument> {
    return todo.save();
  }

  async updateCategory(
    id: string,
    userId: string,
    categoryId: string,
  ): Promise<TodoDocument | null> {
    if (
      !Types.ObjectId.isValid(id) ||
      !Types.ObjectId.isValid(userId) ||
      !Types.ObjectId.isValid(categoryId)
    ) {
      return null;
    }

    const todo = await this.findByIdForUser(id, userId);
    if (!todo) {
      return null;
    }

    todo.categoryId = new Types.ObjectId(categoryId);
    todo.userId = new Types.ObjectId(userId);
    return todo.save();
  }

  async reassignCategory(
    fromCategoryId: string,
    toCategoryId: string,
    userId: string,
  ): Promise<void> {
    await this.todoModel.updateMany(
      {
        userId: idIn(userId),
        categoryId: idIn(fromCategoryId),
      },
      {
        $set: {
          categoryId: new Types.ObjectId(toCategoryId),
          userId: new Types.ObjectId(userId),
        },
      },
    );
  }

  async normalizeUserIds(userId: string): Promise<void> {
    await this.todoModel.collection.updateMany(
      { userId },
      { $set: { userId: new Types.ObjectId(userId) } },
    );

    const stringCategoryTodos = await this.todoModel.collection
      .find({
        $or: [{ userId }, { userId: new Types.ObjectId(userId) }],
        categoryId: { $type: 'string' },
      })
      .toArray();

    for (const todo of stringCategoryTodos) {
      if (
        typeof todo.categoryId === 'string' &&
        Types.ObjectId.isValid(todo.categoryId)
      ) {
        await this.todoModel.collection.updateOne(
          { _id: todo._id },
          { $set: { categoryId: new Types.ObjectId(todo.categoryId) } },
        );
      }
    }
  }

  async delete(todo: TodoDocument): Promise<void> {
    await todo.deleteOne();
  }

  async deleteManyByCategory(
    categoryId: string,
    userId: string,
  ): Promise<void> {
    await this.todoModel.deleteMany({
      userId: idIn(userId),
      categoryId: idIn(categoryId),
    });
  }
}
