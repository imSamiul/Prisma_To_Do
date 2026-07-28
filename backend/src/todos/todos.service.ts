import { Injectable, NotFoundException } from '@nestjs/common';
import { Todo } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class TodosService {
  constructor(
    private prisma: PrismaService,
    private categoriesService: CategoriesService,
  ) {}

  async create(
    userId: string,
    categoryId: string,
    title: string,
    description?: string,
  ): Promise<Todo> {
    const category = await this.categoriesService.findByIdForUser(
      categoryId,
      userId,
    );

    // My Day is a smart list: new tasks land in Tasks and are flagged for today.
    if (category.slug === 'my-day') {
      const tasks = await this.categoriesService.getDefaultCategory(userId);
      return this.prisma.todo.create({
        data: {
          userId,
          categoryId: tasks.id,
          title,
          description,
          inMyDay: true,
        },
      });
    }

    return this.prisma.todo.create({
      data: { userId, categoryId, title, description },
    });
  }

  async findAllForUser(
    userId: string,
    options?: { categoryId?: string; view?: string },
  ): Promise<Todo[]> {
    if (options?.view === 'my-day') {
      return this.prisma.todo.findMany({
        where: { userId, inMyDay: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.todo.findMany({
      where: {
        userId,
        ...(options?.categoryId && { categoryId: options.categoryId }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdForUser(id: string, userId: string): Promise<Todo> {
    // Always scope by authenticated user — never find by id alone
    const todo = await this.prisma.todo.findFirst({ where: { id, userId } });
    if (!todo) {
      throw new NotFoundException(`Todo with id ${id} not found`);
    }
    return todo;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Pick<Todo, 'title' | 'description' | 'completed'>>,
  ): Promise<Todo> {
    await this.findByIdForUser(id, userId);
    return this.prisma.todo.update({ where: { id }, data });
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findByIdForUser(id, userId);
    await this.prisma.todo.delete({ where: { id } });
  }

  async toggleComplete(id: string, userId: string): Promise<Todo> {
    const todo = await this.findByIdForUser(id, userId);
    return this.prisma.todo.update({
      where: { id },
      data: { completed: !todo.completed },
    });
  }

  async setMyDay(
    id: string,
    userId: string,
    inMyDay: boolean,
  ): Promise<Todo> {
    await this.findByIdForUser(id, userId);
    return this.prisma.todo.update({
      where: { id },
      data: { inMyDay },
    });
  }

  async moveToCategory(
    id: string,
    userId: string,
    categoryId: string,
  ): Promise<Todo> {
    await this.findByIdForUser(id, userId);
    const category = await this.categoriesService.findByIdForUser(
      categoryId,
      userId,
    );

    // My Day is a smart list — flag the task instead of changing its home list.
    if (category.slug === 'my-day') {
      return this.prisma.todo.update({
        where: { id },
        data: { inMyDay: true },
      });
    }

    return this.prisma.todo.update({
      where: { id },
      data: { categoryId },
    });
  }
}
