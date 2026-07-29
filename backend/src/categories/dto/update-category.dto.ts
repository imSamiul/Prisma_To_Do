import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
