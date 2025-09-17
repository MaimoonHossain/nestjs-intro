import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { PostsService } from './providers/posts.service';
import { GetPostsParamDto } from './dtos/get-posts-param.dto';
import { CreatePostDto } from './dtos/create-post.dto';
import { PatchPostDto } from './dtos/patch-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // get post by ID
  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  // Get post details with optional query parameter
  @Get()
  getPostDetails(
    @Param() getPostParamDto: GetPostsParamDto,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.postsService.findAll(getPostParamDto, limit, page);
  }

  @Post()
  createPost(@Body(new ValidationPipe()) createPostDto: CreatePostDto) {
    console.log(createPostDto);
    return this.postsService.create(createPostDto);
  }

  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) patchPostDto: PatchPostDto,
  ) {
    return this.postsService.patch(id, patchPostDto);
  }
}
