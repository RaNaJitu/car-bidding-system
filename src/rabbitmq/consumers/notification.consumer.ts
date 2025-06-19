// src/rabbitmq/consumers/notification.consumer.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { connect, Channel, Connection } from 'amqplib';
import { BidGateway } from 'src/bids/bid.gateway';

@Injectable()
export class NotificationConsumer implements OnModuleInit {
  private readonly logger = new Logger(NotificationConsumer.name);
  private connection: Connection;
  private channel: Channel;
  private readonly queue = 'notification.queue';

  constructor(private readonly bidGateway: BidGateway) {}

  async onModuleInit() {
    this.connection = await connect('amqp://localhost');
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(this.queue, { durable: true });

    this.channel.consume(this.queue, async (msg) => {
      if (!msg) return;

      const content = msg.content.toString();
      const payload = JSON.parse(content);
      this.logger.log(`📢 Notification received: ${content}`);

      // Send to appropriate auction room
      this.bidGateway.sendBidUpdate(payload.auctionId, {
        userId: payload.userId,
        amount: payload.amount,
      });

      this.channel.ack(msg);
    });

    this.logger.log(`✅ Subscribed to ${this.queue}`);
  }
}
