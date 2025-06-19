import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuctionModule } from './auctions/auction.module';
import { BidModule } from './bids/bid.module';
import { UserModule } from './users/user.module';
import { RedisModule } from './redis/redis.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { PrismaModule } from './prisma/prisma.module';
import { RabbitMQService } from './rabbitmq/rabbitmq.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { JwtBlacklistGuard } from './auth/jwt-blacklist.guard';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    AuthModule,
    AuctionModule,
    BidModule,
    UserModule,
    RedisModule,
    RabbitMQModule,
    PrismaModule,
    ScheduleModule.forRoot(),
  //   ThrottlerModule.forRoot({
  //     ttl: 60,
  //     // limit: 10,
  //   }),
  // ],
  //   ThrottlerModule.forRoot({
  //     throttlers: [
  //       {
  //         limit: 10,
  //         ttl: 60,
  //       },
  //     ],
  //   }),
  ],
  providers: [
    RabbitMQService,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    {
      provide: APP_GUARD,
      useClass: JwtBlacklistGuard,
    },
  ],
})
export class AppModule {}
