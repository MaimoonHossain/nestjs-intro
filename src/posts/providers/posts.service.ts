import { PaginationProvider } from './../../common/pagination/providers/pagination.provider';
import { CreatePostDto } from '../dtos/create-post.dto';
import {
  BadRequestException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';
import { Repository } from 'typeorm';
import { Post } from '../post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MetaOption } from 'src/meta-options/meta-option.entity';
import { TagsService } from 'src/tags/providers/tags.service';
import { PatchPostDto } from '../dtos/patch-post.dto';
import { GetPostsDto } from '../dtos/get-posts.dto';
import { Paginated } from 'src/common/pagination/interfaces/paginated.interface';

@Injectable()
export class PostsService {
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

  /**
   * Method to create a new post
   */
  public async create(createPostDto: CreatePostDto) {
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

  public async findAll(postQuery: GetPostsDto): Promise<Paginated<Post>> {
    return this.paginationProvider.paginateQuery(
      {
        limit: postQuery.limit,
        page: postQuery.page,
      },
      this.postsRepository,
    );
  }

  public async update(patchPostDto: PatchPostDto) {
    let tags: any = undefined;
    let post: any = undefined;

    try {
      // Find the Tags
      tags = await this.tagsService.findMultipleTags(patchPostDto.tags as any);
    } catch (error) {
      throw new RequestTimeoutException('Request timed out, please try again', {
        description: 'Could not connect to database',
      });
    }

    /* 
      Number of tags need to be equal
    */
    if (patchPostDto.tags && tags.length !== patchPostDto.tags.length) {
      throw new BadRequestException('Number of tags must be equal');
    }

    try {
      // Find the Post
      post = await this.postsRepository.findOneBy({
        id: patchPostDto.id,
      });
    } catch (error) {
      throw new RequestTimeoutException('Request timed out, please try again', {
        description: 'Could not connect to database',
      });
    }

    if (!post) {
      throw new BadRequestException('Post not found');
    }

    // Update the properties of the post
    post.title = patchPostDto.title ?? post.title;
    post.content = patchPostDto.content ?? post.content;
    post.status = patchPostDto.status ?? post.status;
    post.postType = patchPostDto.postType ?? post.postType;
    post.slug = patchPostDto.slug ?? post.slug;
    post.featuredImageUrl =
      patchPostDto.featuredImageUrl ?? post.featuredImageUrl;
    post.publishOn = patchPostDto.publishOn ?? post.publishOn;
    // Assign the new tags
    post.tags = tags;

    try {
      await this.postsRepository.save(post);
    } catch (error) {
      throw new RequestTimeoutException('Request timed out, please try again', {
        description: 'Could not connect to database',
      });
    }

    return post;
  }

  public async delete(id: number) {
    // Deleting the post
    await this.postsRepository.delete(id);
    // confirmation
    return { message: 'Post deleted successfully' };
  }
}
