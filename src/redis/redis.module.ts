import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisSubscriberService } from './redis-subscriber.service';
import { AuctionGateway } from '../auctions/auction.gateway';

@Module({
  providers: [RedisService, RedisSubscriberService, AuctionGateway],
  exports: [RedisService],
})
export class RedisModule {}
