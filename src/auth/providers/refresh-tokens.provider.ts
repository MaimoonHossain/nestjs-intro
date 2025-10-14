import { RefreshTokenDto } from './../dtos/refresh-token.dto';
import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { GenerateTokensProvider } from './generate-tokens.provider';
import { UsersService } from 'src/users/providers/users.service';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

@Injectable()
export class RefreshTokensProvider {
  constructor(
    /*
     * Inject JWT Service
     */
    private readonly jwtService: JwtService,

    /*
     * Inject JWT Service
     */
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,

    /*
     * inject generateTokensProvider
     */
    private readonly generateTokensProvider: GenerateTokensProvider,

    /*
     * Injecting usersService
     */
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}
  public async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      // verify the refresh token using jwtService
      const { sub } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'>
      >(refreshTokenDto.refreshToken, {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
      });
      // fetch the user from the database
      const user = await this.usersService.findOneById(sub);
      // generate new access and refresh tokens
      const tokens = await this.generateTokensProvider.generateTokens(user);
      return tokens;
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }
}
