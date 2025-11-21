import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { CategoryType } from '../common/constants/enums';
import { Budget } from './budget.entity';
import { Transaction } from './transaction.entity';
import { User } from './user.entity';

/**
 * Category Entity - Transaction categories
 * Organizes transactions into income/expense categories
 */
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string; // null for default system categories

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId?: string; // For subcategories

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ 
    type: 'smallint',
    comment: '1=Income, 2=Expense'
  })
  type: CategoryType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string; // Hex color for UI

  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string; // Icon name for UI

  @Column({ type: 'boolean', default: false })
  isDefault: boolean; // System default category

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  sortOrder: number; // For custom ordering

  @Column({ type: 'json', nullable: true })
  keywords: string[]; // Keywords for auto-categorization

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  // Relationships
  @ManyToOne(() => User, user => user.categories, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => Category, category => category.subcategories, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: Category;

  @OneToMany(() => Category, category => category.parent)
  subcategories: Category[];

  @OneToMany(() => Transaction, transaction => transaction.category)
  transactions: Transaction[];

  @OneToMany(() => Budget, budget => budget.category)
  budgets: Budget[];

  // Virtual properties
  get isSubcategory(): boolean {
    return !!this.parentId;
  }

  get hasSubcategories(): boolean {
    return this.subcategories && this.subcategories.length > 0;
  }
}