// import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
// import { RedisService } from './redis.service';
// import { AuctionGateway } from '../auctions/auction.gateway';

// @Injectable()
// export class RedisSubscriberService implements OnModuleInit {
//   private readonly logger = new Logger(RedisSubscriberService.name);

//   constructor(
//     private readonly redisService: RedisService,
//     private readonly auctionGateway: AuctionGateway,
//   ) {}

//   async onModuleInit() {
//     const subscriber = this.redisService.getSubscriber();

//     const pattern = 'auction:*:highestBid';
//     await subscriber.psubscribe(pattern);
//     this.logger.log(`✅ Subscribed to Redis pattern: ${pattern}`);

//     subscriber.on('pmessage', (pattern, channel, message) => {
//       this.logger.log(`📨 Redis message on channel ${channel}: ${message}`);

//       try {
//         const parsed = JSON.parse(message);
//         const [, auctionId] = channel.split(':');

//         // 🔄 Broadcast bid update using gateway method
//         this.auctionGateway.broadcastBidUpdate(auctionId, parsed);
//       } catch (err) {
//         this.logger.error('❌ Failed to handle Redis message', err);
//       }
//     });

//     subscriber.on('error', (err) => {
//       this.logger.error('❌ Redis subscriber connection error:', err);
//     });
//   }

  
// }



import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import { AuctionGateway } from '../auctions/auction.gateway';

@Injectable()
export class RedisSubscriberService implements OnModuleInit {
  private readonly logger = new Logger(RedisSubscriberService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly auctionGateway: AuctionGateway,
  ) {}

  async onModuleInit() {
    const subscriber = this.redisService.getSubscriber();

    const bidPattern = 'auction:*:highestBid';
    const endPattern = 'auction:*:ended';

    // ✅ Subscribe to both bid update and auction end messages
    await subscriber.psubscribe(bidPattern);
    await subscriber.psubscribe(endPattern);

    this.logger.log(`✅ Subscribed to Redis patterns: ${bidPattern}, ${endPattern}`);

    subscriber.on('pmessage', (pattern, channel, message) => {
      this.logger.log(`📨 Redis message on channel ${channel}: ${message}`);

      try {
        const parsed = JSON.parse(message);
        const [prefix, auctionId, type] = channel.split(':');

        if (type === 'highestBid') {
          // 🔄 Broadcast bid update
          this.auctionGateway.broadcastBidUpdate(auctionId, parsed);
        } else if (type === 'ended') {
          // 🏁 Broadcast auction ended
          this.auctionGateway.broadcastAuctionEnded(
            auctionId,
            parsed.winnerId,
            parsed.winningAmount,
          );
        }
      } catch (err) {
        this.logger.error('❌ Failed to handle Redis message', err);
      }
    });

    subscriber.on('error', (err) => {
      this.logger.error('❌ Redis subscriber connection error:', err);
    });
  }
}
