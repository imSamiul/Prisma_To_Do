import { IsBoolean } from 'class-validator';

export class SetMyDayDto {
  @IsBoolean()
  inMyDay: boolean;
}
