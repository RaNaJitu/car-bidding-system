import { forwardRef, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisSubscriberService } from './redis-subscriber.service';
import { AuctionGateway } from '../auctions/auction.gateway';
import { BidModule } from 'src/bids/bid.module';

@Module({
  imports: [forwardRef(() => BidModule)],
  providers: [RedisService, RedisSubscriberService, AuctionGateway],
  exports: [RedisService, RedisSubscriberService],
})
export class RedisModule {}
