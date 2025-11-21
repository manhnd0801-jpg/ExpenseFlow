import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * Create a new category
   */
  async create(userId: string, createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Check if category with same name and type exists
    const existingCategory = await this.categoryRepository.findOne({
      where: {
        userId,
        name: createCategoryDto.name,
        type: createCategoryDto.type,
      },
    });

    if (existingCategory) {
      throw new BadRequestException('Category with this name and type already exists');
    }

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      userId,
      isDefault: false,
    });

    return await this.categoryRepository.save(category);
  }

  /**
   * Find all categories for a user
   */
  async findAll(userId: string, type?: number): Promise<Category[]> {
    const where: any = { userId };
    if (type) where.type = type;

    return await this.categoryRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find one category by ID
   */
  async findOne(userId: string, id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  /**
   * Update a category
   */
  async update(userId: string, id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(userId, id);

    // Prevent updating default categories
    if (category.isDefault) {
      throw new BadRequestException('Cannot update default categories');
    }

    // Check for duplicate name if name is being changed
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: {
          userId,
          name: updateCategoryDto.name,
          type: updateCategoryDto.type || category.type,
        },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new BadRequestException('Category with this name and type already exists');
      }
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  /**
   * Delete a category (soft delete)
   */
  async remove(userId: string, id: string): Promise<void> {
    const category = await this.findOne(userId, id);

    // Prevent deleting default categories
    if (category.isDefault) {
      throw new BadRequestException('Cannot delete default categories');
    }

    // Check if category is being used in transactions
    // This would require checking the Transaction entity, but for now we'll allow deletion
    // In production, you might want to prevent deletion or reassign transactions

    await this.categoryRepository.softDelete(id);
  }

  /**
   * Seed default categories for a new user
   */
  async seedDefaultCategories(userId: string): Promise<void> {
    const defaultCategories = [
      // Expense categories
      { name: 'Food & Dining', type: 2, icon: 'utensils', color: '#FF6B6B' },
      { name: 'Transportation', type: 2, icon: 'car', color: '#4ECDC4' },
      { name: 'Shopping', type: 2, icon: 'shopping-bag', color: '#95E1D3' },
      { name: 'Entertainment', type: 2, icon: 'film', color: '#F38181' },
      { name: 'Bills & Utilities', type: 2, icon: 'file-text', color: '#AA96DA' },
      { name: 'Healthcare', type: 2, icon: 'heart', color: '#FCBAD3' },
      { name: 'Education', type: 2, icon: 'book', color: '#A8D8EA' },
      { name: 'Other Expenses', type: 2, icon: 'more-horizontal', color: '#D3D3D3' },

      // Income categories
      { name: 'Salary', type: 1, icon: 'briefcase', color: '#51CF66' },
      { name: 'Bonus', type: 1, icon: 'gift', color: '#FFD93D' },
      { name: 'Investment', type: 1, icon: 'trending-up', color: '#6BCF7F' },
      { name: 'Side Income', type: 1, icon: 'dollar-sign', color: '#A8E6CF' },
      { name: 'Other Income', type: 1, icon: 'plus-circle', color: '#B4E197' },
    ];

    const categories = defaultCategories.map((cat) =>
      this.categoryRepository.create({
        ...cat,
        userId,
        isDefault: true,
        isActive: true,
      }),
    );

    await this.categoryRepository.save(categories);
  }
}
