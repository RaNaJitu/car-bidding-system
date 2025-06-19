import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { PrismaModule } from '../prisma/prisma.module';
import { DLQConsumerService } from './dlq-consumer.service';
import { AuditConsumer } from './consumers/audit.consumer';
import { AuctionGateway } from '../auctions/auction.gateway';
import { NotificationConsumer } from './consumers/notification.consumer';
import { BidGateway } from 'src/bids/bid.gateway';

@Module({
  imports: [PrismaModule],
  providers: [
    RabbitMQService, 
    DLQConsumerService,
    NotificationConsumer,
    AuditConsumer,
    AuctionGateway,
    BidGateway
  ],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}

