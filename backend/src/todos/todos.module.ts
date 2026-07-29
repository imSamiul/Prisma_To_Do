import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { TodosRepository } from './todos.repository';
import { CategoriesModule } from '../categories/categories.module';
import { AuthModule } from '../auth/auth.module';
import { Todo, TodoSchema } from './schemas/todo.schema';

@Module({
  imports: [
    forwardRef(() => CategoriesModule),
    AuthModule,
    MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }]),
  ],
  controllers: [TodosController],
  providers: [TodosRepository, TodosService],
  exports: [TodosService, TodosRepository],
})
export class TodosModule {}
