import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookRole } from '../../common/constants/enums';
import { SharedBookMember } from '../../entities/shared-book-member.entity';
import { SharedBook } from '../../entities/shared-book.entity';
import { User } from '../../entities/user.entity';
import { AddMemberDto, CreateSharedBookDto, QuerySharedBookDto, UpdateMemberRoleDto, UpdateSharedBookDto } from './dto';

/**
 * Service for managing shared books
 */
@Injectable()
export class SharedBooksService {
  constructor(
    @InjectRepository(SharedBook)
    private sharedBookRepository: Repository<SharedBook>,
    @InjectRepository(SharedBookMember)
    private memberRepository: Repository<SharedBookMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Create new shared book
   */
  async create(userId: string, createDto: CreateSharedBookDto): Promise<SharedBook> {
    const sharedBook = this.sharedBookRepository.create({
      ownerId: userId,
      ...createDto,
      isActive: createDto.isActive ?? true,
    });

    return await this.sharedBookRepository.save(sharedBook);
  }

  /**
   * Find all shared books (owned + member of)
   */
  async findAll(userId: string, query: QuerySharedBookDto): Promise<{ items: SharedBook[]; total: number }> {
    const { page = 1, limit = 20, isActive } = query;
    const skip = (page - 1) * limit;

    // Get owned books
    const ownedQuery = this.sharedBookRepository
      .createQueryBuilder('sb')
      .where('sb.ownerId = :userId', { userId })
      .leftJoinAndSelect('sb.members', 'members')
      .leftJoinAndSelect('members.user', 'memberUser');

    if (isActive !== undefined) {
      ownedQuery.andWhere('sb.isActive = :isActive', { isActive });
    }

    // Get books where user is member
    const memberQuery = this.sharedBookRepository
      .createQueryBuilder('sb')
      .innerJoin('sb.members', 'member')
      .where('member.userId = :userId', { userId })
      .andWhere('member.isActive = :memberActive', { memberActive: true })
      .leftJoinAndSelect('sb.members', 'allMembers')
      .leftJoinAndSelect('allMembers.user', 'memberUser')
      .leftJoinAndSelect('sb.owner', 'owner');

    if (isActive !== undefined) {
      memberQuery.andWhere('sb.isActive = :isActive', { isActive });
    }

    const [ownedBooks] = await ownedQuery.getManyAndCount();
    const [memberBooks] = await memberQuery.getManyAndCount();

    // Combine and deduplicate
    const allBooksMap = new Map<string, SharedBook>();
    [...ownedBooks, ...memberBooks].forEach((book) => allBooksMap.set(book.id, book));
    const items = Array.from(allBooksMap.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(skip, skip + limit);

    return { items, total: allBooksMap.size };
  }

  /**
   * Find one shared book by ID
   */
  async findOne(id: string, userId: string): Promise<SharedBook> {
    const sharedBook = await this.sharedBookRepository.findOne({
      where: { id },
      relations: ['owner', 'members', 'members.user'],
    });

    if (!sharedBook) {
      throw new NotFoundException('Shared book not found');
    }

    // Check if user has access (owner or member)
    await this.checkAccess(id, userId, BookRole.VIEWER);

    return sharedBook;
  }

  /**
   * Update shared book (owner or admin only)
   */
  async update(id: string, userId: string, updateDto: UpdateSharedBookDto): Promise<SharedBook> {
    const sharedBook = await this.sharedBookRepository.findOne({ where: { id } });

    if (!sharedBook) {
      throw new NotFoundException('Shared book not found');
    }

    // Check if user is owner or admin
    await this.checkAccess(id, userId, BookRole.ADMIN);

    Object.assign(sharedBook, updateDto);
    return await this.sharedBookRepository.save(sharedBook);
  }

  /**
   * Delete shared book (owner only)
   */
  async remove(id: string, userId: string): Promise<void> {
    const sharedBook = await this.sharedBookRepository.findOne({ where: { id } });

    if (!sharedBook) {
      throw new NotFoundException('Shared book not found');
    }

    if (sharedBook.ownerId !== userId) {
      throw new ForbiddenException('Only owner can delete shared book');
    }

    await this.sharedBookRepository.softRemove(sharedBook);
  }

  /**
   * Add member to shared book
   */
  async addMember(bookId: string, userId: string, addMemberDto: AddMemberDto): Promise<SharedBookMember> {
    // Check if user is owner or admin
    await this.checkAccess(bookId, userId, BookRole.ADMIN);

    // Find user by email
    const userToAdd = await this.userRepository.findOne({
      where: { email: addMemberDto.email },
    });

    if (!userToAdd) {
      throw new NotFoundException('User not found with this email');
    }

    // Check if already member
    const existingMember = await this.memberRepository.findOne({
      where: { sharedBookId: bookId, userId: userToAdd.id },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member of this book');
    }

    const member = this.memberRepository.create({
      sharedBookId: bookId,
      userId: userToAdd.id,
      role: addMemberDto.role,
      isActive: true,
      acceptedAt: new Date(),
    });

    return await this.memberRepository.save(member);
  }

  /**
   * Get all members of a shared book
   */
  async getMembers(bookId: string, userId: string): Promise<SharedBookMember[]> {
    // Check access
    await this.checkAccess(bookId, userId, BookRole.VIEWER);

    return await this.memberRepository.find({
      where: { sharedBookId: bookId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Update member role (owner or admin only)
   */
  async updateMemberRole(
    bookId: string,
    memberId: string,
    userId: string,
    updateDto: UpdateMemberRoleDto,
  ): Promise<SharedBookMember> {
    // Check if user is owner or admin
    await this.checkAccess(bookId, userId, BookRole.ADMIN);

    const member = await this.memberRepository.findOne({
      where: { id: memberId, sharedBookId: bookId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    member.role = updateDto.role;
    return await this.memberRepository.save(member);
  }

  /**
   * Remove member from shared book
   */
  async removeMember(bookId: string, memberId: string, userId: string): Promise<void> {
    // Check if user is owner or admin
    await this.checkAccess(bookId, userId, BookRole.ADMIN);

    const member = await this.memberRepository.findOne({
      where: { id: memberId, sharedBookId: bookId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    await this.memberRepository.remove(member);
  }

  /**
   * Leave shared book (member can leave)
   */
  async leaveBook(bookId: string, userId: string): Promise<void> {
    const member = await this.memberRepository.findOne({
      where: { sharedBookId: bookId, userId },
    });

    if (!member) {
      throw new NotFoundException('You are not a member of this book');
    }

    await this.memberRepository.remove(member);
  }

  /**
   * Check if user has access to shared book with required role
   */
  private async checkAccess(bookId: string, userId: string, requiredRole: BookRole): Promise<void> {
    const book = await this.sharedBookRepository.findOne({
      where: { id: bookId },
      relations: ['members'],
    });

    if (!book) {
      throw new NotFoundException('Shared book not found');
    }

    // Owner has all access
    if (book.ownerId === userId) {
      return;
    }

    // Check member role
    const member = await this.memberRepository.findOne({
      where: { sharedBookId: bookId, userId, isActive: true },
    });

    if (!member) {
      throw new ForbiddenException('You do not have access to this shared book');
    }

    // Check role hierarchy: Admin(3) > Editor(2) > Viewer(1)
    if (member.role < requiredRole) {
      throw new ForbiddenException('You do not have sufficient permissions for this action');
    }
  }
}
