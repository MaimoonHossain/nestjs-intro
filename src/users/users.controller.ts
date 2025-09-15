import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get(':id/*path')
  public getUserWithPath(@Param('id') id: string, @Param('path') path: string) {
    console.log({ id, path });
    return `You sent a get request to users endpoint with ID: ${id} and path: ${path}`;
  }

  @Get(':id')
  public getUser(@Param('id') id: string) {
    console.log({ id });
    return `You sent a get request to users endpoint with ID: ${id}`;
  }

  @Post()
  public createUsers(@Body() request: any) {
    console.log(request);
    return 'You sent a post request to users endpoint';
  }
}
