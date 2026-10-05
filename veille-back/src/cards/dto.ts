import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { CARD_CATEGORIES, type CardCategory } from './card.entity.js';

export class CreateCardDto {
  @ApiProperty({ example: 'Écrire l’API' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  position?: number;

  @ApiPropertyOptional({ example: '2026-10-31', nullable: true })
  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @ApiPropertyOptional({ enum: CARD_CATEGORIES, nullable: true })
  @IsOptional()
  @IsIn(CARD_CATEGORIES)
  category?: CardCategory | null;
}

export class UpdateCardDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Index (0 = en haut) dans la liste cible',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position?: number;

  @ApiPropertyOptional({ description: 'Liste cible pour déplacer la carte' })
  @IsOptional()
  @IsUUID()
  listId?: string;

  @ApiPropertyOptional({ example: '2026-10-31', nullable: true })
  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @ApiPropertyOptional({ enum: CARD_CATEGORIES, nullable: true })
  @IsOptional()
  @IsIn(CARD_CATEGORIES)
  category?: CardCategory | null;
}
