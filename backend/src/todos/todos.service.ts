import { Injectable, NotFoundException } from '@nestjs/common';
import { Todo, TodoDocument } from './schemas/todo.schema';
import { TodosRepository } from './todos.repository';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class TodosService {
  constructor(
    private readonly todosRepository: TodosRepository,
    private readonly categoriesService: CategoriesService,
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
      return this.todosRepository.create({
        userId,
        categoryId: tasks.id,
        title,
        description,
        inMyDay: true,
      });
    }

    return this.todosRepository.create({
      userId,
      categoryId,
      title,
      description,
    });
  }

  async findAllForUser(
    userId: string,
    options?: { categoryId?: string; view?: string },
  ): Promise<TodoDocument[]> {
    if (options?.view === 'my-day') {
      return this.todosRepository.findByUserId(userId, { inMyDay: true });
    }

    return this.todosRepository.findByUserId(userId, {
      categoryId: options?.categoryId,
    });
  }

  async findByIdForUser(id: string, userId: string): Promise<TodoDocument> {
    // Always scope by authenticated user — never find by id alone
    const todo = await this.todosRepository.findByIdForUser(id, userId);
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
    return this.todosRepository.save(todo);
  }

  async delete(id: string, userId: string): Promise<void> {
    const todo = await this.findByIdForUser(id, userId);
    await this.todosRepository.delete(todo);
  }

  async toggleComplete(id: string, userId: string): Promise<TodoDocument> {
    const todo = await this.findByIdForUser(id, userId);
    todo.completed = !todo.completed;
    return this.todosRepository.save(todo);
  }

  async setMyDay(
    id: string,
    userId: string,
    inMyDay: boolean,
  ): Promise<TodoDocument> {
    const todo = await this.findByIdForUser(id, userId);
    todo.inMyDay = inMyDay;
    return this.todosRepository.save(todo);
  }

  async moveToCategory(
    id: string,
    userId: string,
    categoryId: string,
  ): Promise<TodoDocument> {
    const category = await this.categoriesService.findByIdForUser(
      categoryId,
      userId,
    );

    // My Day is a smart list — flag the task instead of changing its home list.
    if (category.slug === 'my-day') {
      const todo = await this.findByIdForUser(id, userId);
      todo.inMyDay = true;
      return this.todosRepository.save(todo);
    }

    const updated = await this.todosRepository.updateCategory(
      id,
      userId,
      categoryId,
    );
    if (!updated) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }
    return updated;
  }
}
