import { UsersService } from './../../users/providers/users.service';
import { CreatePostDto } from './../dtos/create-post.dto';
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { GetPostsParamDto } from '../dtos/get-posts-param.dto';
import { PatchPostDto } from '../dtos/patch-post.dto';

export interface Post {
  id: number;
  title: string;
  description: string;
  user: {
    id: number;
    firstName: string;
    email: string;
  };
}

@Injectable()
export class PostsService implements OnModuleInit {
  private posts: Post[] = [];

  constructor(private readonly usersService: UsersService) {}

  onModuleInit() {
    // ✅ initialize posts after DI has injected UsersService
    const user = this.usersService.findOneById(1234);

    this.posts = [
      {
        id: 1,
        title: 'My first post',
        description: 'This is a great post',
        user,
      },
      {
        id: 2,
        title: 'My second post',
        description: 'This is my second great post',
        user,
      },
    ];
  }

  findAll(
    getPostsParamDto: GetPostsParamDto,
    limit: number,
    page: number,
  ): Post[] {
    const start = (page - 1) * limit;
    return this.posts.slice(start, start + limit);
  }

  findOne(id: number): Post {
    const post = this.posts.find((p) => p.id === id);
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  create(createPostDto: CreatePostDto): Post {
    // For demo: always assign user ID = 1 (could be dynamic later)
    const user = this.usersService.findOneById(1);

    const newPost: Post = {
      id: this.posts.length + 1,
      ...createPostDto,
      user,
    };

    this.posts.push(newPost);
    return newPost;
  }

  patch(id: number, patchPostDto: PatchPostDto): Post {
    const post = this.findOne(id);
    const updatedPost = { ...post, ...patchPostDto };
    const index = this.posts.findIndex((p) => p.id === id);
    this.posts[index] = updatedPost;
    return updatedPost;
  }
}
