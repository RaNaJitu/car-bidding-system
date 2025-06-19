import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuctionStatus } from '@prisma/client';
import { Cron } from '@nestjs/schedule';
import { AuctionGateway } from './auction.gateway';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/redis/redis.service';


@Injectable()
export class AuctionService {
  constructor(
    private prisma: PrismaService,
    private auctionGateway: AuctionGateway,
    private redisService: RedisService,
    private jwtService: JwtService,
  ) {}

  async createAuction(data: {
    carId: string;
    startTime: Date;
    endTime: Date;
    startingBid: number;
  }) {
    return this.prisma.auction.create({
      data: {
        carId: data.carId,
        startTime: data.startTime,
        endTime: data.endTime,
        startingBid: data.startingBid,
        currentHighest: data.startingBid,
        status: AuctionStatus.PENDING,
      },
    });
  }

  async getAllAuctions() {
    return this.prisma.auction.findMany({
      include: { bids: true },
    });
  }

  async getAuctionBids(auctionId: string) {
    return this.prisma.bid.findMany({
      where: { auctionId },
      orderBy: { amount: 'desc' },
      include: {
        user: { select: { id: true, userName: true } },
      },
    });
  }

  @Cron('*/30 * * * * *')
  async updateAuctionStatus() {
    const now = new Date();
    console.log('⏰ Running auction scheduler at:', now.toISOString());

    // 1. Start PENDING auctions
    const activated = await this.prisma.auction.updateMany({
      where: {
        status: 'PENDING',
        startTime: { lte: now },
        endTime: { gt: now },
      },
      data: { status: 'ACTIVE' },
    });
    console.log(`🟢 Activated ${activated.count} auctions`);

    // 2. Find all ACTIVE auctions that have ended
    const completedAuctions = await this.prisma.auction.findMany({
      where: {
        status: 'ACTIVE',
        endTime: { lte: now },
      },
    });

    // 3. Process each completed auction
    for (const auction of completedAuctions) {
      const highestBid = await this.prisma.bid.findFirst({
        where: { auctionId: auction.id },
        orderBy: { amount: 'desc' },
      });

      // 4. Update DB
      await this.prisma.auction.update({
        where: { id: auction.id },
        data: {
          status: 'COMPLETED',
          winnerId: highestBid?.userId?.toString() ?? null,
        },
      });

      const winnerId = highestBid?.userId ?? null;
      const winningAmount = highestBid?.amount ?? auction.currentHighest;

      console.log(`🏁 Auction ${auction.id} ended. Winner: ${winnerId ?? 'No bids'}`);

      // 5. Broadcast via WebSocket
      this.auctionGateway.broadcastAuctionEnded(auction.id, winnerId, winningAmount);

      // 6. Publish to Redis for other instances
      const redisClient = this.redisService.getPublisher(); // Use getClient()
      await redisClient.publish(
        `auction:${auction.id}:ended`,
        JSON.stringify({ winnerId, winningAmount }),
      );
    }

    console.log(`🔴 Completed ${completedAuctions.length} auctions`);
  }

  async getAuctionById(id: string) {
    return this.prisma.auction.findUnique({ where: { id } });
  }

  async getLeaderboard(auctionId: string, top: number) {
    // Fetch top bidders by amount descending
    return this.prisma.bid.groupBy({
      by: ['userId'],
      where: { auctionId },
      _max: { amount: true },
      orderBy: { _max: { amount: 'desc' } },
      take: top,
    });
  }

  async validateUser(userName: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { userName } });
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return user;
  }

  // async logout(token: string) {
  //   const decoded = this.jwtService.decode(token) as { exp?: number } | null;
  //   if (!decoded?.exp) {
  //     throw new Error('Invalid token');
  //   }
  //   const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  //   if (ttl > 0) {
  //     await this.redisService.getPublisher().set(`blacklist:${token}`, '1', 'EX', ttl);
  //   }
  // }
}
