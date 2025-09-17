import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(26)
  title: string;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(96)
  description: string;
}
