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





import { Injectable, OnModuleInit } from '@nestjs/common';
import { Channel, connect } from 'amqplib';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private channel: Channel;

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const connection = await connect('amqp://localhost');
    this.channel = await connection.createChannel();

    const queue = 'bids';
    await this.channel.assertQueue(queue);

    this.channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const bid = JSON.parse(msg.content.toString());
        console.log('[RabbitMQ] Consumed bid:', bid);

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
          console.error('[RabbitMQ] Failed to save bid to DB:', error);
          // Optionally nack the message: this.channel.nack(msg);
        }
      }
    });
  }

  async publishBid(bid: { auctionId: string; userId: number; amount: number }) {
    const queue = 'bids';
    await this.channel.assertQueue(queue);
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(bid)));
    console.log('[RabbitMQ] Published bid:', bid);
  }
}
