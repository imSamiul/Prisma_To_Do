import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodoDocument } from './schemas/todo.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/jwt-payload';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { SetMyDayDto } from './dto/set-my-day.dto';
import { MoveTodoDto } from './dto/move-todo.dto';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private todosService: TodosService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Body() createTodoDto: CreateTodoDto,
  ): Promise<{ message: string; data: TodoDocument }> {
    const todo = await this.todosService.create(
      user.userId,
      createTodoDto.categoryId,
      createTodoDto.title,
      createTodoDto.description,
    );

    return { message: 'Todo created successfully', data: todo };
  }

  @Get()
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query('categoryId') categoryId?: string,
    @Query('view') view?: string,
  ): Promise<{ message: string; data: TodoDocument[] }> {
    const todos = await this.todosService.findAllForUser(user.userId, {
      categoryId,
      view,
    });
    return { message: 'Todos fetched', data: todos };
  }

  @Get(':id')
  async findById(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<{ message: string; data: TodoDocument }> {
    const todo = await this.todosService.findByIdForUser(id, user.userId);
    return { message: 'Todo found', data: todo };
  }

  @Put(':id/toggle-complete')
  async toggleComplete(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<{ message: string; data: TodoDocument }> {
    const todo = await this.todosService.toggleComplete(id, user.userId);
    return {
      message: `Todo ${todo.completed ? 'completed' : 'incomplete'} successfully`,
      data: todo,
    };
  }

  @Put(':id/my-day')
  async setMyDay(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: SetMyDayDto,
  ): Promise<{ message: string; data: TodoDocument }> {
    const todo = await this.todosService.setMyDay(
      id,
      user.userId,
      body.inMyDay,
    );
    return {
      message: body.inMyDay
        ? 'Added to My Day'
        : 'Removed from My Day',
      data: todo,
    };
  }

  @Put(':id/move')
  async move(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: MoveTodoDto,
  ): Promise<{ message: string; data: TodoDocument }> {
    const todo = await this.todosService.moveToCategory(
      id,
      user.userId,
      body.categoryId,
    );
    return { message: 'Todo moved successfully', data: todo };
  }

  @Put(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<{ message: string; data: TodoDocument }> {
    const todo = await this.todosService.update(
      id,
      user.userId,
      updateTodoDto,
    );
    return { message: 'Todo updated successfully', data: todo };
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.todosService.delete(id, user.userId);
    return { message: 'Todo deleted successfully' };
  }
}
