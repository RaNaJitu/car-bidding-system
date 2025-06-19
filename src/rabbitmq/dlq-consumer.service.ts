import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service'; // optional if Redis alerting
import { connect, Channel, Connection } from 'amqplib';

@Injectable()
export class DLQConsumerService implements OnModuleInit {
  private connection: Connection;
  private channel: Channel;
  private readonly dlqQueue = 'bids.dlq';
  private readonly logger = new Logger(DLQConsumerService.name);

  async onModuleInit() {
    try {
      this.connection = await connect('amqp://localhost');
      this.channel = await this.connection.createChannel();

      await this.channel.assertQueue(this.dlqQueue, { durable: true });

      this.channel.consume(this.dlqQueue, async (msg) => {
        if (!msg) return;

        const failedMessage = msg.content.toString();
        this.logger.warn(`[DLQ] Received failed bid message: ${failedMessage}`);

        // Optionally: Notify admin or store to DB/Redis
        // Optionally: Retry logic or move to audit log

        this.channel.ack(msg);
      });

      this.logger.log(`✅ DLQ consumer started. Watching "${this.dlqQueue}"`);
    } catch (err) {
      this.logger.error('❌ Failed to start DLQ consumer:', err);
    }
  }
}
