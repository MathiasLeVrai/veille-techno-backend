import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from '../cards/card.entity.js';
import { CreateListDto, UpdateListDto } from './dto.js';
import { List } from './list.entity.js';

/**
 * Le tableau est partagé par toute l'équipe : ce sont les permissions du rôle
 * (voir `PermissionsGuard`) qui décident qui peut modifier quoi.
 */
@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List) private lists: Repository<List>,
    @InjectRepository(Card) private cards: Repository<Card>,
  ) {}

  findAll() {
    return this.lists.find({ order: { position: 'ASC' } });
  }

  async create(dto: CreateListDto, ownerId: string) {
    const last = await this.lists.findOne({
      where: {},
      order: { position: 'DESC' },
    });
    const list = this.lists.create({
      title: dto.title,
      position: dto.position ?? (last ? last.position + 1 : 0),
      ownerId,
    });
    return this.lists.save(list);
  }

  async update(id: string, dto: UpdateListDto) {
    const list = await this.getOrFail(id);
    if (dto.title !== undefined) list.title = dto.title;
    if (dto.position !== undefined) list.position = dto.position;
    return this.lists.save(list);
  }

  async remove(id: string) {
    await this.getOrFail(id);
    await this.cards.delete({ listId: id });
    await this.lists.delete(id);
  }

  async getOrFail(id: string) {
    const list = await this.lists.findOne({ where: { id } });
    if (!list) {
      throw new NotFoundException('Liste introuvable');
    }
    return list;
  }
}
