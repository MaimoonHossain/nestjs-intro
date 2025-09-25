import { CreatePostDto } from '../dtos/create-post.dto';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/providers/users.service';
import { Repository } from 'typeorm';
import { Post } from '../post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MetaOption } from 'src/meta-options/meta-option.entity';

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
  ) {}

  /**
   * Method to create a new post
   */
  public async create(createPostDto: CreatePostDto) {
    const post = this.postsRepository.create({
      ...createPostDto,
      metaOptions: createPostDto.metaOptions
        ? (createPostDto.metaOptions as any) // let cascade handle persistence
        : undefined,
    });

    return await this.postsRepository.save(post);
  }

  public async findAll() {
    // const user = this.usersService.findOneById(Number(userId));

    let posts = await this.postsRepository.find({});

    return posts;
  }

  public async delete(id: number) {
    // Find the post
    let post = await this.postsRepository.findOneBy({ id });
    // Deleting the post
    await this.postsRepository.delete(id);
    // Delete meta options if post and metaOptions exist
    if (post?.metaOptions?.id) {
      await this.metaOptionsRepository.delete(post.metaOptions.id);
    }
    // confirmation
    return { message: 'Post deleted successfully' };
  }
}
