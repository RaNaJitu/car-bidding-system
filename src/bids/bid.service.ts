// import { Injectable } from '@nestjs/common';
// import { RedisService } from 'src/redis/redis.service'; 
// import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service'; 
// import { BidGateway } from './bid.gateway';
// import { PrismaService } from '../prisma/prisma.service';
// import Redis from 'ioredis';

// @Injectable()
// export class BidService {
//   private redisClient: Redis;

//   constructor(
//     private redisService: RedisService,
//     private rabbitMQService: RabbitMQService,
//     private bidGateway: BidGateway,
//     private prisma: PrismaService,
//   ) {
//     this.redisClient = this.redisService.getClient(); // make sure this returns an ioredis instance
//   }

//   // async placeBid(auctionId: string, userId: number, amount: number) {
//   //   const redisKey = `auction:${auctionId}:highestBid`;
//   //   console.log('[placeBid] Watching key:', redisKey);

//   //   try {
//   //     await this.redisClient.watch(redisKey);
//   //     const currentHighestBid = await this.redisClient.get(redisKey);
//   //     console.log('[placeBid] Current highest bid:', currentHighestBid);

//   //     const current = currentHighestBid ? parseFloat(currentHighestBid) : 0;

//   //     if (amount <= current) {
//   //       await this.redisClient.unwatch();
//   //       throw new Error('Bid must be higher than current highest bid');
//   //     }

//   //     const multi = this.redisClient.multi();
//   //     multi.set(redisKey, amount.toString());
//   //     const execResult = await multi.exec();

//   //     if (execResult === null) {
//   //       throw new Error('Bid conflict detected. Try again.');
//   //     }

//   //     console.log('[placeBid] Bid accepted:', { auctionId, userId, amount });

//   //     await this.rabbitMQService.publishBid({ auctionId, userId, amount });
//   //     this.bidGateway.sendBidUpdate(auctionId, { userId, amount });

//   //     return { status: 'success', auctionId, userId, amount };
//   //   } catch (error: any) {
//   //     console.error('[placeBid] Error:', error.message);
//   //     throw error;
//   //   }
//   // }

// // async placeBid(auctionId: string, userId: number, amount: number, retries = 5): Promise<any> {
// //   const redisKey = `auction:${auctionId}:highestBid`;
// //   console.log(`[placeBid] Redis key: ${redisKey}`);

// //   while (retries > 0) {
// //     try {
// //       await this.redisClient.watch(redisKey);

// //       const currentHighestBid = await this.redisClient.get(redisKey);
// //       console.log(`[placeBid] Current highest bid from Redis: ${currentHighestBid}`);
      
// //       const current = currentHighestBid ? parseFloat(currentHighestBid) : 0;

// //       console.log(`[placeBid] Parsed current highest bid: ${current}`);
// //   console.log(`[placeBid] Incoming bid amount: ${amount}`);

// //       if (amount <= current) {
// //         await this.redisClient.unwatch();
        
// //         throw new Error('Bid must be higher than current highest bid');
// //       }

// //       const multi = this.redisClient.multi();
// //       multi.set(redisKey, amount.toString());

// //       const execResult = await multi.exec();

// //       if (execResult === null) {
// //         retries--;
// //         await this.delay(100);
// //         continue;
// //       }

// //       await this.rabbitMQService.publishBid({ auctionId, userId, amount });
// //       this.bidGateway.sendBidUpdate(auctionId, { userId, amount });

// //       return { status: 'success', auctionId, userId, amount };
// //     } catch (error) {
// //       throw error;
// //     }
// //   }

// //   throw new Error('Bid conflict detected after multiple retries. Please try again.');
// // }

// // async placeBid(auctionId: string, userId: number, amount: number) {
// //   const redisKey = `auction:${auctionId}:highestBid`;
// //   const maxRetries = 3;
// //   console.log("🚀 ~ BidService ~ placeBid ~ redisKey:", redisKey)

// //   for (let attempt = 1; attempt <= maxRetries; attempt++) {
// //     try {
// //       await this.redisClient.watch(redisKey);
// //       const currentHighestBid = await this.redisClient.get(redisKey);
// //       console.log("🚀 ~ BidService ~ placeBid ~ currentHighestBid:", currentHighestBid)
// //       const current = currentHighestBid ? parseFloat(currentHighestBid) : 0;
// //       console.log("🚀 ~ BidService ~ placeBid ~ current:", current)

// //       if (amount <= current) {
// //         await this.redisClient.unwatch();
// //         throw new Error('Bid must be higher than current highest bid');
// //       }

// //       const multi = this.redisClient.multi();
// //       multi.set(redisKey, amount.toString());
// //       const execResult = await multi.exec();

// //       if (execResult === null) {
// //         console.log(`Bid conflict on attempt ${attempt}, retrying...`);
// //         continue; // retry loop
// //       }

// //       await this.rabbitMQService.publishBid({ auctionId, userId, amount });
// //       this.bidGateway.sendBidUpdate(auctionId, { userId, amount });

// //       return { status: 'success', auctionId, userId, amount };
// //     } catch (error: any) {
// //       if (error.message === 'Bid must be higher than current highest bid') {
// //         throw error;
// //       }
// //       if (attempt === maxRetries) {
// //         throw new Error('Failed to place bid due to concurrency. Please try again.');
// //       }
// //     }
// //   }
// // }




// async placeBid(auctionId: string, userId: number, amount: number) {

//   const auction = await this.prisma.auction.findUnique({
//     where: { id: auctionId },
//   });

//   if (!auction || auction.status !== "ACTIVE") {
//     throw new Error("Cannot place bid. Auction is not active.");
//   }
//   const redisKey = `auction:${auctionId}:highestBid`;
//   const maxRetries = 5; // you can adjust
//   let attempts = 1;

//   while (attempts < maxRetries) {
//     attempts++;
//     await this.redisClient.watch(redisKey);
//     const currentHighestBid = await this.redisClient.get(redisKey);
//     const current = currentHighestBid ? parseFloat(currentHighestBid) : 0;

//     if (amount <= current) {
//       await this.redisClient.unwatch();
//       throw new Error('Bid must be higher than current highest bid');
//     }

//     const multi = this.redisClient.multi();
//     multi.set(redisKey, amount.toString());

//     const execResult = await multi.exec();

//     if (execResult === null) {
//       // Conflict detected, retry after small delay
//       await new Promise((res) => setTimeout(res, 20000)); 
//       continue;
//     }

//     // Success
//     await this.rabbitMQService.publishBid({ auctionId, userId, amount });
//     this.bidGateway.sendBidUpdate(auctionId, { userId, amount });

//     return { status: 'success', auctionId, userId, amount };
//   }

//   throw new Error('Bid conflict detected. Please try again.');
// }






// // Helper delay function
// private delay(ms: number) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// // const dely = (ms: number) => new Promise(res => setTimeout(res, ms));

// async placeBidWithRetry(auctionId: string, userId: number, amount: number, retries = 3) {
//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       return await this.placeBid(auctionId, userId, amount);
//     } catch (error: any) {
//       if (error.message !== 'Bid conflict, try again') {
//         throw error; // Only retry for concurrency conflict
//       }
//       const backoff = 100 * Math.pow(2, attempt); // exponential backoff
//       await delay(backoff + Math.random() * 50); // add jitter
//     }
//   }
//   throw new Error('Bid failed after max retries');
// }



//   async getCurrentHighestBid(auctionId: string): Promise<number> {
//   const redisKey = `auction:${auctionId}:highestBid`;
//   const current = await this.redisClient.get(redisKey);
//   return current ? parseFloat(current) : 0;
// }

// }

// function delay(ms: number) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }



import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service'; 
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service'; 
import { BidGateway } from './bid.gateway';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';

@Injectable()
export class BidService {
  private redisPublisher: Redis;

  constructor(
    private redisService: RedisService,
    private rabbitMQService: RabbitMQService,
    private bidGateway: BidGateway,
    private prisma: PrismaService,
  ) {
    // Use Redis publisher client for publishing bids
    this.redisPublisher = this.redisService.getPublisher();
  }

  async placeBid(auctionId: string, userId: number, amount: number) {
    const auction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
    });

    if (!auction || auction.status !== "ACTIVE") {
      throw new Error("Cannot place bid. Auction is not active.");
    }

    const redisKey = `auction:${auctionId}:highestBid`;
    const maxRetries = 5;
    let attempts = 0;

    while (attempts < maxRetries) {
      attempts++;
      await this.redisPublisher.watch(redisKey);
      const currentHighestBid = await this.redisPublisher.get(redisKey);
      const current = currentHighestBid ? parseFloat(currentHighestBid) : 0;

      if (amount <= current) {
        await this.redisPublisher.unwatch();
        throw new Error('Bid must be higher than current highest bid');
      }

      const multi = this.redisPublisher.multi();
      multi.set(redisKey, amount.toString());

      const execResult = await multi.exec();

      if (execResult === null) {
        // Conflict detected, retry after small delay
        await delay(200); // reduced delay for better retry speed
        continue;
      }

      // Success - publish to RabbitMQ & notify clients via Gateway
      await this.rabbitMQService.publishBid({ auctionId, userId, amount });
      this.bidGateway.sendBidUpdate(auctionId, { userId, amount });

      
      // ✅ Broadcast to Redis Pub/Sub for syncing other instances
      await this.redisPublisher.publish(
        `auction:${auctionId}:highestBid`,
        JSON.stringify({ userId, amount })
      );

      return { status: 'success', auctionId, userId, amount };
    }

    throw new Error('Bid conflict detected. Please try again.');
  }

  // Retry wrapper with exponential backoff and jitter
  async placeBidWithRetry(auctionId: string, userId: number, amount: number, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.placeBid(auctionId, userId, amount);
      } catch (error: any) {
        if (error.message !== 'Bid conflict detected. Please try again.') {
          throw error; // Only retry on concurrency conflicts
        }
        const backoff = 100 * Math.pow(2, attempt); // exponential backoff
        await delay(backoff + Math.random() * 50);  // add jitter
      }
    }
    throw new Error('Bid failed after max retries');
  }

  async getCurrentHighestBid(auctionId: string): Promise<number> {
    const redisKey = `auction:${auctionId}:highestBid`;
    const current = await this.redisPublisher.get(redisKey);
    return current ? parseFloat(current) : 0;
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
