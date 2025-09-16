import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Req,
  ParseIntPipe,
  DefaultValuePipe,
  ValidationPipe,
  Patch,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { GetUsersParamDto } from './dtos/get-users-param.dto';
import { PatchUserDto } from './dtos/patch-user.dto';

@Controller('users')
export class UsersController {
  // 1️⃣ Get user by ID
  @Get(':id')
  getUser(@Param('id') id: string) {
    return `You requested user with ID: ${id}`;
  }

  // 2️⃣ Get user details with optional query parameter
  @Get(':id/details')
  getUserDetails(
    @Param() getUserParamDto: GetUsersParamDto,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number, // optional
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    console.log(getUserParamDto);
    return `User ID: , Limit: ${limit ?? 'not provided'}, Page: ${page ?? 'not provided'}`;
  }

  // 3️⃣ Catch-all for any path after ID
  @Get(':id/*')
  getUserWildcard(@Param('id') id: string, @Req() req: any) {
    // Extract the wildcard path
    const path = req.url.split(`/users/${id}/`)[1];
    return `User ID: ${id}, Path: ${path}`;
  }

  // 4️⃣ Create a new user
  @Post()
  createUser(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return `Created user with data`;
  }

  @Patch()
  public patchUser(@Body() patchUserDto: PatchUserDto) {
    return patchUserDto;
  }
}
