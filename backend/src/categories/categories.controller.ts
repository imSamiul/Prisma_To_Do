import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoryDocument } from './schemas/category.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/jwt-payload';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateCategoryDto,
  createCategorySchema,
} from './dto/create-category.dto';
import {
  UpdateCategoryDto,
  updateCategorySchema,
} from './dto/update-category.dto';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(createCategorySchema))
    createCategoryDto: CreateCategoryDto,
  ): Promise<{ message: string; data: CategoryDocument }> {
    const category = await this.categoriesService.create(
      user.userId,
      createCategoryDto.name,
      createCategoryDto.description,
    );

    return { message: 'Category created successfully', data: category };
  }

  @Get()
  async findAll(
    @CurrentUser() user: AuthUser,
  ): Promise<{ message: string; data: CategoryDocument[] }> {
    const categories = await this.categoriesService.findByUserId(user.userId);
    return { message: 'Categories fetched', data: categories };
  }

  @Get(':id')
  async findById(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<{ message: string; data: CategoryDocument }> {
    const category = await this.categoriesService.findByIdForUser(
      id,
      user.userId,
    );
    return { message: 'Category found', data: category };
  }

  @Put(':id')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCategorySchema))
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<{ message: string; data: CategoryDocument }> {
    const category = await this.categoriesService.update(
      id,
      user.userId,
      updateCategoryDto,
    );
    return { message: 'Category updated successfully', data: category };
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.categoriesService.delete(id, user.userId);
    return { message: 'Category deleted successfully' };
  }
}
