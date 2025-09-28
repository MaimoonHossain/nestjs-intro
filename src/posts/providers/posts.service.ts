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
    // Find the author from database based on authorId
    let author = await this.usersService.findOneById(createPostDto.authorId);

    const post = this.postsRepository.create({
      ...createPostDto,
      metaOptions: createPostDto.metaOptions
        ? (createPostDto.metaOptions as any)
        : undefined,
      author: author ? author : undefined,
    });

    return await this.postsRepository.save(post);
  }

  public async findAll() {
    let posts = await this.postsRepository.find({
      relations: ['author', 'metaOptions'],
    });

    return posts;
  }

  public async delete(id: number) {
    // Deleting the post
    await this.postsRepository.delete(id);
    // confirmation
    return { message: 'Post deleted successfully' };
  }
}
