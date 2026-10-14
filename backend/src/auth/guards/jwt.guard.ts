import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private getCookieValue(cookieHeader: string | undefined, key: string): string | undefined {
    if (!cookieHeader) {
      return undefined;
    }

    const parts = cookieHeader.split(';').map((chunk) => chunk.trim());
    const target = parts.find((chunk) => chunk.startsWith(`${key}=`));
    if (!target) {
      return undefined;
    }

    return target.slice(key.length + 1);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const tokenFromCookie = this.getCookieValue(
      request.headers.cookie,
      'accessToken',
    );
    let token: string | undefined;

    if (authHeader) {
      const [scheme, bearerToken] = authHeader.split(' ');
      if (scheme === 'Bearer' && bearerToken) {
        token = bearerToken;
      }
    }

    if (!token && tokenFromCookie) {
      token = tokenFromCookie;
    }

    if (!token) {
      throw new UnauthorizedException('No access token provided');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
