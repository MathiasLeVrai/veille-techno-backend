import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export const CARD_CATEGORIES = [
  'feature',
  'bug',
  'tech',
  'doc',
  'design',
] as const;
export type CardCategory = (typeof CARD_CATEGORIES)[number];

@Entity()
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: 0 })
  position: number;

  @Column()
  listId: string;

  /** Format `YYYY-MM-DD`. */
  @Column({ type: 'varchar', nullable: true })
  dueDate: string | null;

  @Column({ type: 'varchar', nullable: true })
  category: CardCategory | null;

  @Column({ type: 'varchar', nullable: true })
  createdById: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
