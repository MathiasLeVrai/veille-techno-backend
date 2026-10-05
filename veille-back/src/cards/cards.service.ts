import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListsService } from '../lists/lists.service.js';
import { Card } from './card.entity.js';
import { CreateCardDto, UpdateCardDto } from './dto.js';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card) private cards: Repository<Card>,
    private lists: ListsService,
  ) {}

  findAll() {
    return this.cards.find({ order: { listId: 'ASC', position: 'ASC' } });
  }

  async findByList(listId: string) {
    await this.lists.getOrFail(listId);
    return this.cards.find({ where: { listId }, order: { position: 'ASC' } });
  }

  async create(listId: string, dto: CreateCardDto, userId: string) {
    await this.lists.getOrFail(listId);
    const last = await this.cards.findOne({
      where: { listId },
      order: { position: 'DESC' },
    });
    const card = this.cards.create({
      title: dto.title,
      description: dto.description ?? '',
      position: dto.position ?? (last ? last.position + 1 : 0),
      dueDate: dto.dueDate ?? null,
      category: dto.category ?? null,
      createdById: userId,
      listId,
    });
    return this.cards.save(card);
  }

  async findOne(id: string) {
    const card = await this.cards.findOne({ where: { id } });
    if (!card) {
      throw new NotFoundException('Carte introuvable');
    }
    return card;
  }

  async update(id: string, dto: UpdateCardDto) {
    const card = await this.findOne(id);
    if (dto.title !== undefined) card.title = dto.title;
    if (dto.description !== undefined) card.description = dto.description;
    if (dto.dueDate !== undefined) card.dueDate = dto.dueDate;
    if (dto.category !== undefined) card.category = dto.category;

    const moving = dto.listId !== undefined || dto.position !== undefined;
    if (!moving) {
      return this.cards.save(card);
    }

    const sourceListId = card.listId;
    const targetListId = dto.listId ?? sourceListId;
    if (targetListId !== sourceListId) {
      await this.lists.getOrFail(targetListId);
    }

    // Les positions sont renumérotées 0..n-1 dans les listes touchées, dans une
    // transaction pour qu'un déplacement ne laisse jamais deux cartes au même rang.
    return this.cards.manager.transaction(async (em) => {
      const repo = em.getRepository(Card);
      const target = (
        await repo.find({
          where: { listId: targetListId },
          order: { position: 'ASC' },
        })
      ).filter((c) => c.id !== card.id);
      const index = Math.min(dto.position ?? target.length, target.length);

      card.listId = targetListId;
      target.splice(index, 0, card);
      target.forEach((c, i) => (c.position = i));
      await repo.save(target);

      if (targetListId !== sourceListId) {
        const source = await repo.find({
          where: { listId: sourceListId },
          order: { position: 'ASC' },
        });
        source.forEach((c, i) => (c.position = i));
        await repo.save(source);
      }
      return card;
    });
  }

  async remove(id: string) {
    const card = await this.findOne(id);
    await this.cards.delete(card.id);
  }
}
