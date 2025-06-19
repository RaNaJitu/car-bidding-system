// import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
// import { Channel, Connection, connect } from 'amqplib';
// import { PrismaService } from '../prisma/prisma.service';

// interface BidMessage {
//   auctionId: string;
//   userId: number;
//   amount: number;
// }

// @Injectable()
// export class RabbitMQService implements OnModuleInit {
//   private connection: Connection;
//   private channel: Channel;
//   private readonly logger = new Logger(RabbitMQService.name);
//   private readonly queueName = 'bids';

//   constructor(private prisma: PrismaService) {}

//   async onModuleInit() {
//     try {
//       this.connection = await connect('amqp://localhost');
//       this.channel = await this.connection.createChannel();

//       await this.channel.assertQueue(this.queueName, {
//         durable: true,
//       });

//       this.channel.consume(this.queueName, async (msg) => {
//         if (msg !== null) {
//           const bid: BidMessage = JSON.parse(msg.content.toString());
//           this.logger.log(`[RabbitMQ] Consumed bid: ${JSON.stringify(bid)}`);

//           try {
//             await this.prisma.bid.create({
//               data: {
//                 auctionId: bid.auctionId,
//                 userId: bid.userId,
//                 amount: bid.amount,
//               },
//             });
//             this.channel.ack(msg);
//           } catch (error) {
//             this.logger.error('[RabbitMQ] Failed to save bid to DB:', error);
//             this.channel.nack(msg, false, false); // reject & discard (or set requeue = true if needed)
//           }
//         }
//       });

//       this.logger.log('✅ RabbitMQ initialized and consuming.');
//     } catch (error) {
//       this.logger.error('❌ Failed to initialize RabbitMQ:', error);
//     }
//   }

//   async publishBid(bid: BidMessage) {
//     if (!this.channel) {
//       throw new Error('RabbitMQ channel not initialized.');
//     }

//     await this.channel.assertQueue(this.queueName, { durable: true });
//     this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(bid)), {
//       persistent: true,
//     });

//     this.logger.log('[RabbitMQ] Published bid:', bid);
//   }
// }





// import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
// import { Channel, Connection, connect } from 'amqplib';
// import { PrismaService } from '../prisma/prisma.service';

// interface BidMessage {
//   auctionId: string;
//   userId: number;
//   amount: number;
// }

// @Injectable()
// export class RabbitMQService implements OnModuleInit {
//   private connection: Connection;
//   private channel: Channel;
//   private readonly logger = new Logger(RabbitMQService.name);
//   private readonly queueName = 'bids';

//   constructor(private prisma: PrismaService) {}

//   async onModuleInit() {
//     try {
//       this.connection = await connect('amqp://localhost');
//       this.channel = await this.connection.createChannel();

//       await this.channel.assertQueue(this.queueName, {
//         durable: true,
//       });

//       this.channel.consume(this.queueName, async (msg) => {
//         if (msg !== null) {
//           const bid: BidMessage = JSON.parse(msg.content.toString());
//           this.logger.log(`[RabbitMQ] Consumed bid: ${JSON.stringify(bid)}`);

//           try {
//             await this.prisma.bid.create({
//               data: {
//                 auctionId: bid.auctionId,
//                 userId: bid.userId,
//                 amount: bid.amount,
//               },
//             });
//             this.channel.ack(msg);
//           } catch (error) {
//             this.logger.error('[RabbitMQ] Failed to save bid to DB:', error);
//             this.channel.nack(msg, false, false); // reject & discard (or set requeue = true if needed)
//           }
//         }
//       });

//       this.logger.log('✅ RabbitMQ initialized and consuming.');
//     } catch (error) {
//       this.logger.error('❌ Failed to initialize RabbitMQ:', error);
//     }
//   }

//   async publishBid(bid: BidMessage) {
//     if (!this.channel) {
//       throw new Error('RabbitMQ channel not initialized.');
//     }

//     await this.channel.assertQueue(this.queueName, { durable: true });
//     this.channel.sendToQueue(this.queueName, Buffer.from(JSON.stringify(bid)), {
//       persistent: true,
//     });

//     this.logger.log('[RabbitMQ] Published bid:', bid);
//   }
// }


// src/rabbitmq/rabbitmq.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Channel, Connection, connect } from 'amqplib';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection: Connection;
  private channel: Channel;
  private readonly logger = new Logger(RabbitMQService.name);

  private readonly bidQueue = 'bids';
  private readonly notificationQueue = 'notification.queue';
  private readonly auditQueue = 'audit.queue';

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      this.connection = await connect('amqp://localhost');
      this.channel = await this.connection.createChannel();

      await this.channel.assertQueue(this.bidQueue, { durable: true });
      await this.channel.assertQueue(this.notificationQueue, { durable: true });
      await this.channel.assertQueue(this.auditQueue, { durable: true });

      this.channel.consume(this.bidQueue, async (msg) => {
        if (!msg) return;

        const bid = JSON.parse(msg.content.toString());
        this.logger.log(`[✔] Consumed bid: ${JSON.stringify(bid)}`);

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
          this.logger.error(`[✘] Failed to save bid:`, error);
          this.channel.nack(msg, false, false); // send to DLQ if configured
        }
      });

      this.logger.log('✅ RabbitMQ initialized and queues ready.');
    } catch (err) {
      this.logger.error('❌ Failed to connect to RabbitMQ', err);
    }
  }

  // 🔁 Publish bid to be saved (main bid processing queue)
  async publishBid(bid: { auctionId: string; userId: number; amount: number }) {
    this.channel.sendToQueue(
      this.bidQueue,
      Buffer.from(JSON.stringify(bid)),
      { persistent: true }
    );
    this.logger.log(`[📤] Bid queued: ${JSON.stringify(bid)}`);
  }

  // 📢 Send to WebSocket consumers
  async publishNotification(payload: {
    type?: string,
    auctionId: string;
    userId?: number;
    amount?: number;
    winnerId?: number | null;
    winningAmount?: number;
    timestamp?: string;
  }) {
    this.channel.sendToQueue(
      this.notificationQueue,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true }
    );
    this.logger.log(`[🔔] Notification queued: ${JSON.stringify(payload)}`);
  }

  // 📝 Audit all actions
  async publishAuditLog(event: {
    type: string;
    auctionId: string;
    userId?: number;
    amount?: number;
    winningAmount?: number
    timestamp?: string;
    winnerId?: string | null;
    details?: any;
  }) {
    this.channel.sendToQueue(
      this.auditQueue,
      Buffer.from(JSON.stringify({ ...event, timestamp: new Date().toISOString() })),
      { persistent: true }
    );
    this.logger.log(`[🗂️] Audit log sent: ${event.type}`);
  }
}
