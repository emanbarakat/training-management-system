import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/auth.dto';
import { JwtGuard } from './guards/jwt.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  private getCookieValue(cookieHeader: string | undefined, key: string): string | undefined {
    if (!cookieHeader) return undefined;

    const target = cookieHeader
      .split(';')
      .map((chunk) => chunk.trim())
      .find((chunk) => chunk.startsWith(`${key}=`));

    return target ? target.slice(key.length + 1) : undefined;
  }

  private cookieOptions(maxAge: number) {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge,
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate a user and return access and refresh tokens' })
  @ApiResponse({ status: 201, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.authService.ensureNotLockedOut(loginDto.email);

    try {
      const user = await this.usersService.validateCredentials(
        loginDto.email,
        loginDto.password,
      );

      this.authService.clearFailedLoginAttempts(loginDto.email);

      const permissions = this.authService.getPermissionsForRole(user.role);
      const accessToken = await this.authService.generateAccessToken(user, permissions);
      const refreshToken = await this.authService.generateRefreshToken(user);

      res.cookie('accessToken', accessToken, this.cookieOptions(24 * 60 * 60 * 1000));
      res.cookie('refreshToken', refreshToken, this.cookieOptions(7 * 24 * 60 * 60 * 1000));

      return {
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            permissions,
          },
        },
      };
    } catch (error) {
      this.authService.recordFailedLoginAttempt(
        loginDto.email,
        req.ip || 'unknown',
      );
      throw new UnauthorizedException('Invalid email or password');
    }
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh the access token using a refresh token' })
  @ApiResponse({ status: 200, description: 'Refresh token successful' })
  @ApiResponse({ status: 401, description: 'Refresh token invalid or missing' })
  async refreshToken(
    @Body() body: { refreshToken?: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      body?.refreshToken ??
      this.getCookieValue(req.headers.cookie, 'refreshToken');

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const payload = this.authService.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findOne(payload.sub);
    const permissions = this.authService.getPermissionsForRole(user.role);

    const newAccessToken = await this.authService.generateAccessToken(
      user,
      permissions,
    );
    const newRefreshToken = await this.authService.generateRefreshToken(user);

    res.cookie('accessToken', newAccessToken, this.cookieOptions(24 * 60 * 60 * 1000));
    res.cookie('refreshToken', newRefreshToken, this.cookieOptions(7 * 24 * 60 * 60 * 1000));

    return {
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    };
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Log out the authenticated user and clear cookies' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtGuard)
  getProfile(@Req() req: Request & { user: any }) {
    return { data: req.user };
  }
}
