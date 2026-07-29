import { IsMongoId } from 'class-validator';

export class MoveTodoDto {
  @IsMongoId()
  categoryId!: string;
}
