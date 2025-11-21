import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedBookMember } from '../../entities/shared-book-member.entity';
import { SharedBook } from '../../entities/shared-book.entity';
import { User } from '../../entities/user.entity';
import { SharedBooksController } from './shared-books.controller';
import { SharedBooksService } from './shared-books.service';

/**
 * Module for shared books management
 */
@Module({
  imports: [TypeOrmModule.forFeature([SharedBook, SharedBookMember, User])],
  controllers: [SharedBooksController],
  providers: [SharedBooksService],
  exports: [SharedBooksService],
})
export class SharedBooksModule {}
