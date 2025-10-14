import { Body, Injectable } from '@nestjs/common';
import { CreatePostDto } from '../dtos/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../post.entity';
import { UsersService } from 'src/users/providers/users.service';
import { MetaOption } from 'src/meta-options/meta-option.entity';
import { TagsService } from 'src/tags/providers/tags.service';
import { PaginationProvider } from 'src/common/pagination/providers/pagination.provider';

@Injectable()
export class CreatePostProvider {
  constructor(
    /*
     * Injecting Users Service
     */
    private readonly usersService: UsersService,

    /**
     * Injecting postsRepository
     */
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,

    /**
     * Inject metaOptionsRepository
     */
    @InjectRepository(MetaOption)
    private readonly metaOptionsRepository: Repository<MetaOption>,

    /**
     * Inject TagsService
     */
    private readonly tagsService: TagsService,

    /*
     * Injecting PaginationProvider
     */
    private readonly paginationProvider: PaginationProvider,
  ) {}

  public async create(@Body() createPostDto: CreatePostDto) {
    // Find the author from database based on authorId
    let author = await this.usersService.findOneById(createPostDto.authorId);

    // Find the tags from database based on tagsId
    let tags = await this.tagsService.findMultipleTags(
      createPostDto.tags as any,
    );

    const post = this.postsRepository.create({
      ...createPostDto,
      metaOptions: createPostDto.metaOptions
        ? (createPostDto.metaOptions as any)
        : undefined,
      author: author ? author : undefined,
      tags: tags ? tags : undefined,
    });

    return await this.postsRepository.save(post);
  }
}
