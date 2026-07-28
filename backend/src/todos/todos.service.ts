import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private todoModel: Model<TodoDocument>,
    private categoriesService: CategoriesService,
  ) {}

  async create(
    userId: string,
    categoryId: string,
    title: string,
    description?: string,
  ): Promise<TodoDocument> {
    const category = await this.categoriesService.findByIdForUser(
      categoryId,
      userId,
    );

    // My Day is a smart list: new tasks land in Tasks and are flagged for today.
    if (category.slug === 'my-day') {
      const tasks = await this.categoriesService.getDefaultCategory(userId);
      return this.todoModel.create({
        userId,
        categoryId: tasks.id,
        title,
        description,
        inMyDay: true,
      });
    }

    return this.todoModel.create({ userId, categoryId, title, description });
  }

  async findAllForUser(
    userId: string,
    options?: { categoryId?: string; view?: string },
  ): Promise<TodoDocument[]> {
    if (options?.view === 'my-day') {
      return this.todoModel
        .find({ userId, inMyDay: true })
        .sort({ createdAt: -1 });
    }

    return this.todoModel
      .find({
        userId,
        ...(options?.categoryId && { categoryId: options.categoryId }),
      })
      .sort({ createdAt: -1 });
  }

  async findByIdForUser(id: string, userId: string): Promise<TodoDocument> {
    // Always scope by authenticated user — never find by id alone
    const todo = Types.ObjectId.isValid(id)
      ? await this.todoModel.findOne({ _id: id, userId })
      : null;
    if (!todo) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }
    return todo;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Pick<Todo, 'title' | 'description' | 'completed'>>,
  ): Promise<TodoDocument> {
    const todo = await this.findByIdForUser(id, userId);
    Object.assign(todo, data);
    return todo.save();
  }

  async delete(id: string, userId: string): Promise<void> {
    const todo = await this.findByIdForUser(id, userId);
    await todo.deleteOne();
  }

  async toggleComplete(id: string, userId: string): Promise<TodoDocument> {
    const todo = await this.findByIdForUser(id, userId);
    todo.completed = !todo.completed;
    return todo.save();
  }

  async setMyDay(
    id: string,
    userId: string,
    inMyDay: boolean,
  ): Promise<TodoDocument> {
    const todo = await this.findByIdForUser(id, userId);
    todo.inMyDay = inMyDay;
    return todo.save();
  }

  async moveToCategory(
    id: string,
    userId: string,
    categoryId: string,
  ): Promise<TodoDocument> {
    const todo = await this.findByIdForUser(id, userId);
    const category = await this.categoriesService.findByIdForUser(
      categoryId,
      userId,
    );

    // My Day is a smart list — flag the task instead of changing its home list.
    if (category.slug === 'my-day') {
      todo.inMyDay = true;
      return todo.save();
    }

    todo.categoryId = category._id as Types.ObjectId;
    return todo.save();
  }
}
