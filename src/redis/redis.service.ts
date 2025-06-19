// import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import Redis from 'ioredis';

// @Injectable()
// export class RedisService implements OnModuleInit, OnModuleDestroy {
//   private client!: Redis;

//   onModuleInit() {
//     this.client = new Redis({
//       host: 'localhost',
//       port: 6379,
//     });
//   }

//   async get(key: string): Promise<string | null> {
//     return this.client.get(key);
//   }

//   async set(key: string, value: string, expireSeconds?: number) {
//     if (expireSeconds) {
//       return this.client.set(key, value, 'EX', expireSeconds);
//     }
//     return this.client.set(key, value);
//   }

//   async onModuleDestroy() {
//     await this.client.quit();
//   }
// }


// import { Injectable } from '@nestjs/common';
// import Redis from 'ioredis';

// @Injectable()
// export class RedisService {
//   private readonly client: Redis;

//   constructor() {
//     this.client = new Redis(); // optionally pass config
//   }

//   getClient(): Redis {
//     return this.client;
//   }
// }



import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly publisher: Redis;
  private readonly subscriber: Redis;

  constructor() {
    this.publisher = new Redis();  // Publisher client
    this.subscriber = new Redis(); // Subscriber client
  }

  getPublisher(): Redis {
    return this.publisher;
  }

  getSubscriber(): Redis {
    return this.subscriber;
  }

  async onModuleDestroy() {
    await Promise.all([
      this.publisher.quit(),
      this.subscriber.quit(),
    ]);
  }


  // ✅ Add user to auction room set
  async addUserToAuction(auctionId: string, userId: string) {
    const key = `auction:${auctionId}:users`;
    await this.publisher.sadd(key, userId);
  }

  // ✅ Remove user from auction room set
  async removeUserFromAuction(auctionId: string, userId: string) {
    const key = `auction:${auctionId}:users`;
    await this.publisher.srem(key, userId);
  }

  // ✅ Get all users in auction room set
  async getAuctionUsers(auctionId: string): Promise<string[]> {
    const key = `auction:${auctionId}:users`;
    return await this.publisher.smembers(key);
  }

  // ✅ Optional: Count active users
  async countAuctionUsers(auctionId: string): Promise<number> {
    const key = `auction:${auctionId}:users`;
    return await this.publisher.scard(key);
  }
}
