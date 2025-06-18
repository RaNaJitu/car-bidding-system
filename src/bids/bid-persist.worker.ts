import * as amqp from 'amqplib';
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();

  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  const queue = 'bid_queue';

  await channel.assertQueue(queue, { durable: true });

  channel.consume(
    queue,
    async (msg) => {
      if (msg) {
        const bidData = JSON.parse(msg.content.toString());

        try {
          // Persist bid using Prisma
          await prisma.bid.create({
            data: {
              amount: bidData.amount,
              auctionId: bidData.auctionId,
              userId: bidData.userId,
              // timestamp defaults to now()
            },
          });

          channel.ack(msg);
          console.log('Bid saved:', bidData);
        } catch (error) {
          console.error('Failed to save bid:', error);
          // nack with requeue false to avoid infinite retry if error is permanent
          channel.nack(msg, false, false);
        }
      }
    },
    { noAck: false },
  );

  console.log('Bid persistence worker started');
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
