import { Module, OnModuleInit } from '@nestjs/common';
import { AuctionModule } from './auctions/auction.module';
import { BidModule } from './bids/bid.module';
import { UserModule } from './users/user.module';
import { RedisModule } from './redis/redis.module';
import { RabbitMQModule } from './rabbitmq/rabbitmq.module';
import { PrismaModule } from './prisma/prisma.module';
import { RabbitMQService } from './rabbitmq/rabbitmq.service';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [
    AuctionModule,
    BidModule,
    UserModule,
    RedisModule,
    RabbitMQModule,
    PrismaModule,
    ScheduleModule.forRoot(),
  ],
  providers: [RabbitMQService], 
})
export class AppModule {}
