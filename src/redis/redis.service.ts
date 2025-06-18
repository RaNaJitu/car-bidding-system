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


import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis(); // optionally pass config
  }

  getClient(): Redis {
    return this.client;
  }
}