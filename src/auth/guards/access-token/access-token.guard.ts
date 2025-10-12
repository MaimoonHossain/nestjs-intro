import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import jwtConfig from 'src/auth/config/jwt.config';
import { Request } from 'express';
import { REQUEST_USER_KEY } from 'src/auth/constants/auth.constants';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    /*
     * inject jwtService
     */
    private readonly jwtService: JwtService,
    /*
     * inject jwtConfiguration
     */
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extract the request from the context
    const request = context.switchToHttp().getRequest();
    // Extract the access token from the authorization header
    const token = this.extractRequestFromHeader(request);
    // Validate the access token
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      request[REQUEST_USER_KEY] = payload;
      console.log(payload);
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractRequestFromHeader(request: Request): string | undefined {
    const [_, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }
}
