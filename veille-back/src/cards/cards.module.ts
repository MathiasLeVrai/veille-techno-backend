import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListsModule } from '../lists/lists.module.js';
import { Card } from './card.entity.js';
import { CardsController } from './cards.controller.js';
import { CardsService } from './cards.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Card]), ListsModule],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
