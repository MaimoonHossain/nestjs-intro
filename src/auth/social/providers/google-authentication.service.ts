import { GoogleTokenDto } from './../dtos/google-token.dto';
import {
  forwardRef,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import type { ConfigType } from '@nestjs/config';
import jwtConfig from 'src/auth/config/jwt.config';
import { UsersService } from 'src/users/providers/users.service';
import { GenerateTokensProvider } from 'src/auth/providers/generate-tokens.provider';

@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {
  private oauthClient: OAuth2Client;

  constructor(
    /*
     * Inject usersService
     */
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    /*
     * Inject jwtConfiguation
     */
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    /*
     * Inject generateTokensProvider
     */
    private readonly generateTokensProvider: GenerateTokensProvider,
  ) {}

  onModuleInit() {
    const clientId = this.jwtConfiguration.googleClientId;
    const clientSecret = this.jwtConfiguration.googleClientSecret;
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  public async authenticate(googleTokenDto: GoogleTokenDto) {
    try {
      // verify the Google Token sent by User
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: googleTokenDto.token,
      });

      console.log(loginTicket);

      const payload = loginTicket.getPayload();
      if (!payload) {
        throw new Error('Invalid Google token payload');
      }
      const {
        email,
        sub: googleId,
        given_name: firstName,
        family_name: lastName,
      } = payload as any;

      // Extract the payload from Google JWT
      // Find the user in the database using the Goodle ID
      const user = await this.usersService.findOneByGoogleId(googleId);
      // If gooleId exists generate token
      if (user) {
        return this.generateTokensProvider.generateTokens(user);
      }
      // If not create a new user and then generate token
      const newUser: any = await this.usersService.createGoogleUser({
        email,
        firstName,
        googleId,
        lastName,
      });

      return this.generateTokensProvider.generateTokens(newUser);
    } catch (err) {
      // throw unauthorized exception
      throw new UnauthorizedException(err);
    }
  }
}
