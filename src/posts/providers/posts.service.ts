import { CreatePostDto } from '../dtos/create-post.dto';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';
import { Repository } from 'typeorm';
import { Post } from '../post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MetaOption } from 'src/meta-options/meta-option.entity';
import { TagsService } from 'src/tags/providers/tags.service';
import { PatchPostDto } from '../dtos/patch-post.dto';

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

  public async findAll() {
    let posts = await this.postsRepository.find({
      relations: ['author', 'metaOptions', 'tags'],
    });

    return posts;
  }

  public async update(patchPostDto: PatchPostDto) {
    // Find the Tags
    let tags = await this.tagsService.findMultipleTags(
      patchPostDto.tags as any,
    );
    // Find the Post
    let post = await this.postsRepository.findOneBy({
      id: patchPostDto.id,
    });
    // Update the properties of the post
    if (post) {
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

      // Save the post and return
      return await this.postsRepository.save(post);
    }
  }

  public async delete(id: number) {
    // Deleting the post
    await this.postsRepository.delete(id);
    // confirmation
    return { message: 'Post deleted successfully' };
  }
}
