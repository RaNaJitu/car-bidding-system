// src/rabbitmq/consumers/audit.consumer.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { connect, Channel, Connection } from 'amqplib';

@Injectable()
export class AuditConsumer implements OnModuleInit {
  private readonly logger = new Logger(AuditConsumer.name);
  private connection: Connection;
  private channel: Channel;
  private readonly queue = 'audit.queue';

  async onModuleInit() {
    this.connection = await connect('amqp://localhost');
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(this.queue, { durable: true });

    this.channel.consume(this.queue, (msg) => {
      if (!msg) return;

      const content = msg.content.toString();
      const event = JSON.parse(content);

      this.logger.log(`📝 Audit log: ${JSON.stringify(event)}`);
      this.channel.ack(msg);
    });

    this.logger.log(`✅ Subscribed to ${this.queue}`);
  }
}
