import { Body, Controller, Post } from '@nestjs/common';
import { TagsService } from './providers/tags.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateTagDto } from './dtos/create-tag.dto';

@Controller('tags')
export class TagsController {
  constructor(
    /* Injecting tagsService */
    private readonly tagsService: TagsService,
  ) {}

  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({
    status: 201,
    description: 'The tag has been successfully created.',
  })
  @Post()
  public create(@Body() createTagDto: CreateTagDto) {
    return this.tagsService.create(createTagDto);
  }
}
