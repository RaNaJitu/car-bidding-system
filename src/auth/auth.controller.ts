import { Controller, Post, Body, UnauthorizedException, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsString } from 'class-validator';
import { Public } from './public.decorator';
import { ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { RedisService } from 'src/redis/redis.service';
import { JwtBlacklistGuard } from './jwt-blacklist.guard';
import { JwtService } from '@nestjs/jwt';

export class LoginDto {
@ApiProperty({ example: 'jeet', description: 'email' })
  @IsString()
  userName!: string;

  @ApiProperty({ example: 'Admin123', description: 'email' })
  @IsString()
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private redisService: RedisService,
    private jwtService: JwtService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.userName,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user);
  }

  @ApiBearerAuth('access-token')
  @Post('logout')
//   @UseGuards(JwtBlacklistGuard) 
  async logout(@Req() req: Request) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (token) {
      const decoded = this.jwtService.decode(token) as { exp?: number } | null;
      if (decoded?.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await this.redisService.getPublisher().set(`blacklist:${token}`, '1', 'EX', ttl);
        }
      }
    }

    return { message: 'Logged out successfully' };
  }
}
