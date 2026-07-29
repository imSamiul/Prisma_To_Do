import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from './categories.repository';
import { AuthModule } from '../auth/auth.module';
import { TodosModule } from '../todos/todos.module';
import { Category, CategorySchema } from './schemas/category.schema';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => TodosModule),
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesRepository, CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
