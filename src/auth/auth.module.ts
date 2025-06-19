import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../users/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtBlacklistGuard } from './jwt-blacklist.guard';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET, // use env var in prod
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtBlacklistGuard, RedisService],
  controllers: [AuthController],
  exports: [AuthService, JwtBlacklistGuard, JwtModule],
})
export class AuthModule {}
