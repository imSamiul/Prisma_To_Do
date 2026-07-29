import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateTodoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
