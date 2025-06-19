// import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import * as amqp from 'amqplib';

// @Injectable()
// export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
//   private connection: amqp.Connection;
//   private channel: amqp.Channel;

//   async onModuleInit() {
//     this.connection = await amqp.connect('amqp://localhost');
//     this.channel = await this.connection.createChannel();
//   }

//   async sendToQueue(queue: string, message: string) {
//     await this.channel.assertQueue(queue, { durable: true });
//     this.channel.sendToQueue(queue, Buffer.from(message));
//   }

//   async consume(queue: string, callback: (msg: amqp.ConsumeMessage) => void) {
//     await this.channel.assertQueue(queue, { durable: true });
//     this.channel.consume(queue, callback, { noAck: false });
//   }

//   async onModuleDestroy() {
//     await this.channel.close();
//     await this.connection.close();
//   }
// }


// src/rabbitmq/rabbitmq.service.ts





// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { Channel, connect } from 'amqplib';
// import { PrismaService } from '../prisma/prisma.service';

// @Injectable()
// export class RabbitMQService implements OnModuleInit {
//   private channel: Channel;

//   constructor(private prisma: PrismaService) {}

//   async onModuleInit() {
//     const connection = await connect('amqp://localhost');
//     this.channel = await connection.createChannel();

//     const queue = 'bids';
//     await this.channel.assertQueue(queue);

//     this.channel.consume(queue, async (msg) => {
//       if (msg !== null) {
//         const bid = JSON.parse(msg.content.toString());
//         console.log('[RabbitMQ] Consumed bid:', bid);

//         try {
//           await this.prisma.bid.create({
//             data: {
//               auctionId: bid.auctionId,
//               userId: bid.userId,
//               amount: bid.amount,
//             },
//           });
//           this.channel.ack(msg);
//         } catch (error) {
//           console.error('[RabbitMQ] Failed to save bid to DB:', error);
//           // Optionally nack the message: this.channel.nack(msg);
//         }
//       }
//     });
//   }

//   async publishBid(bid: { auctionId: string; userId: number; amount: number }) {
//     const queue = 'bids';
//     await this.channel.assertQueue(queue);
//     this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(bid)));
//     console.log('[RabbitMQ] Published bid:', bid);
//   }
// }





import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Channel, Connection, connect } from 'amqplib';
import { PrismaService } from '../prisma/prisma.service';

interface BidMessage {
  auctionId: string;
  userId: number;
  amount: number;
}

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection: Connection;
  private channel: Channel;
  private readonly logger = new Logger(RabbitMQService.name);
  private readonly queueName = 'bids';

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    try {
      this.connection = await connect('amqp://localhost');
      this.channel = await this.connection.createChannel();

      await this.channel.assertQueue(this.queueName, {
        durable: true,
      });

      this.channel.consume(this.queueName, async (msg) => {
        if (msg !== null) {
          const bid: BidMessage = JSON.parse(msg.content.toString());
          this.logger.log(`[RabbitMQ] Consumed bid: ${JSON.stringify(bid)}`);

          try {
            await this.prisma.bid.create({
              data: {
                auctionId: bid.auctionId,
                userId: bid.userId,
                amount: bid.amount,
              },
            });
            this.channel.ack(msg);
          } catch (error) {
            this.logger.error('[RabbitMQ] Failed to save bid to DB:', error);
            this.channel.nack(msg, false, false); // reject & discard (or set requeue = true if needed)
          }
        }
      });

      this.logger.log('✅ RabbitMQ initialized and consuming.');
    } catch (error) {
      this.logger.error('❌ Failed to initialize RabbitMQ:', error);
    }
  }

  async publishBid(bid: BidMessage) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized.');
    }

    await this.channel.assertQueue(this.queueName, { durable: true });
    this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(bid)), {
      persistent: true,
    });

    this.logger.log('[RabbitMQ] Published bid:', bid);
  }
}
