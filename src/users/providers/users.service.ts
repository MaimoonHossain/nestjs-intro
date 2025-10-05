import { CreateUserDto } from './../dtos/create-user.dto';
import { AuthService } from './../../auth/providers/auth.service';
import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { GetUsersParamDto } from '../dtos/get-users-param.dto';
import { DataSource, Repository } from 'typeorm';
import { User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import type { ConfigType } from '@nestjs/config';
import profileConfig from '../config/profile.config';
import { UsersCreateManyProvider } from './users-create-many.provider';
import { CreateManyUsersDto } from '../dtos/create-many-users.dto';

/**
 * Class to connect users table and perform business operations
 */
@Injectable()
export class UsersService {
  /**
   * Constructor for auth service
   */
  // constructor(
  //   @Inject(forwardRef(() => AuthService))
  //   private readonly authService: AuthService,
  // ) {}

  constructor(
    /**
     * Injecting usersRepository
     */
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @Inject(profileConfig.KEY)
    private readonly profileConfiguration: ConfigType<typeof profileConfig>,

    /*
     * Injecting Datasource
     */
    private readonly dataSource: DataSource,

    /*
     * Injecting usersCreateManyProvider
     */
    private readonly usersCreateManyProvider: UsersCreateManyProvider,
  ) {}

  public async createUser(createUserDto: CreateUserDto) {
    let existingUser: User | null = null;

    try {
      // Check is user exists with same email
      existingUser = await this.usersRepository.findOne({
        where: {
          email: createUserDto.email,
        },
      });
    } catch (error) {
      throw new RequestTimeoutException('Request timed out, please try again', {
        description: 'Could not connect to database',
      });
    }

    if (existingUser) {
      throw new BadRequestException('User already exists with same email');
    }

    // Handle exception
    // Create a new user
    let newUser = this.usersRepository.create(createUserDto);

    try {
      newUser = await this.usersRepository.save(newUser);
    } catch (error) {
      throw new RequestTimeoutException('Request timed out, please try again', {
        description: 'Could not connect to database',
      });
    }

    return newUser;
  }
  /**
   * Fetch all users
   * @param getUsersParamDto Filter params
   * @param limit Number of users per page
   * @param page Page number
   */
  public findAll(
    getUsersParamDto: GetUsersParamDto,
    limit: number,
    page: number,
  ) {
    throw new HttpException(
      {
        status: HttpStatus.MOVED_PERMANENTLY,
        error: 'This route has been deprecated. Please use /v2/users',
        fileName: 'users.service.ts',
        lineNumber: 74,
      },
      HttpStatus.MOVED_PERMANENTLY,
      {
        cause: new Error(),
        description: 'This route has been deprecated. Please use /v2/users',
      },
    );
    // console.log(this.profileConfiguration.apiKey);
    // return [
    //   {
    //     firstName: 'John',
    //     email: 'john@gmail.com',
    //   },
    //   {
    //     firstName: 'Alice',
    //     email: 'alice@gmail.com',
    //   },
    // ];
  }

  /**
   * Find one user by Id
   * @param id user id
   */
  public async findOneById(id: number) {
    // Find the user
    let user: User | null = null;

    try {
      user = await this.usersRepository.findOneBy({ id });
    } catch (error) {
      throw new RequestTimeoutException('Request timed out, please try again', {
        description: 'Could not connect to database',
      });
    }

    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    return user;
  }

  public async createMany(createManyUsersDto: CreateManyUsersDto) {
    return await this.usersCreateManyProvider.createMany(createManyUsersDto);
  }
}
