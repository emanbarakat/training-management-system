import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

type LoginAttemptInfo = {
  count: number;
  firstFailedAt: number;
  lockedUntil?: number;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly loginAttempts = new Map<string, LoginAttemptInfo>();
  private readonly maxAttempts = 5;
  private readonly lockoutDurationMs = 15 * 60 * 1000;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  getPermissionsForRole(role: string): string[] {
    const map: Record<string, string[]> = {
      admin: ['*'],
      training_manager: [
        'programs:read',
        'programs:write',
        'tracks:read',
        'tracks:write',
        'reports:read',
      ],
      instructor: ['grades:read', 'grades:write', 'evaluations:write'],
      student_affairs: ['students:read', 'students:write', 'attendance:write'],
      student: ['profile:read', 'profile:write', 'grades:read'],
    };

    return map[role] ?? [];
  }

  async generateAccessToken(user: User, permissions: string[]): Promise<string> {
    const payload = {
      userId: user.id,
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions,
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION', '86400'),
      secret: this.configService.get('JWT_SECRET'),
    });
  }

  async generateRefreshToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '604800'),
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (error) {
      return null;
    }
  }

  verifyRefreshToken(token: string): any {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  ensureNotLockedOut(email: string): void {
    const normalizedEmail = email.toLowerCase();
    const info = this.loginAttempts.get(normalizedEmail);
    const now = Date.now();

    if (!info) {
      return;
    }

    if (info.lockedUntil && info.lockedUntil > now) {
      throw new HttpException(
        'Too many failed attempts. Try again in 15 minutes.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (info.lockedUntil && info.lockedUntil <= now) {
      this.loginAttempts.delete(normalizedEmail);
    }
  }

  recordFailedLoginAttempt(email: string, ipAddress: string): void {
    const normalizedEmail = email.toLowerCase();
    const now = Date.now();
    const current = this.loginAttempts.get(normalizedEmail);

    if (!current || (current.lockedUntil && current.lockedUntil <= now)) {
      this.loginAttempts.set(normalizedEmail, { count: 1, firstFailedAt: now });
    } else {
      current.count += 1;
      if (current.count >= this.maxAttempts) {
        current.lockedUntil = now + this.lockoutDurationMs;
      }
      this.loginAttempts.set(normalizedEmail, current);
    }

    const updated = this.loginAttempts.get(normalizedEmail)!;
    this.logger.warn(
      `Failed login attempt for ${normalizedEmail} from ${ipAddress}. Attempt ${updated.count}/${this.maxAttempts}`,
    );

    if (updated.lockedUntil && updated.lockedUntil > now) {
      this.logger.warn(
        `Account lockout triggered for ${normalizedEmail} until ${new Date(updated.lockedUntil).toISOString()}`,
      );
    }
  }

  clearFailedLoginAttempts(email: string): void {
    this.loginAttempts.delete(email.toLowerCase());
  }
}
