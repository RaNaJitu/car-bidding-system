// import { Module } from '@nestjs/common';
// import { BidService } from './bid.service';
// import { PrismaModule } from '../prisma/prisma.module';
// import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

// @Module({
//   imports: [PrismaModule, RabbitmqModule],
//   providers: [BidService],
//   exports: [BidService],
// })
// export class BidModule {}

// import { Module } from '@nestjs/common';
// import { BidService } from './bid.service';
// import { BidController } from './bid.controller';
// import { BidGateway } from './bid.gateway';
// import { PrismaService } from '../prisma/prisma.service';
// import { RedisModule } from '../redis/redis.module';
// import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
// // import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module'; 
// @Module({
//   imports: [RedisModule, RabbitMQModule],
// //   imports: [RedisModule, RabbitmqModule],
//   controllers: [BidController],
//   providers: [BidService, BidGateway, PrismaService],
// })
// export class BidModule {}


import { Module } from '@nestjs/common';
import { BidService } from './bid.service';
import { BidController } from './bid.controller';
import { BidGateway } from './bid.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [PrismaModule, RedisModule, RabbitMQModule],
  controllers: [BidController],
  providers: [BidService, BidGateway],
  exports: [BidService], // ✅ This line is REQUIRED
})
export class BidModule {}



