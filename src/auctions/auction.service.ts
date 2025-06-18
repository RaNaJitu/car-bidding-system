import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuctionStatus } from '@prisma/client';
import { Cron } from '@nestjs/schedule';
import { AuctionGateway } from './auction.gateway';


@Injectable()
export class AuctionService {
  constructor(
  private prisma: PrismaService,
  private auctionGateway: AuctionGateway,
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

  // async getAuctionBids(auctionId: string) {
  //   return this.prisma.bid.findMany({
  //     where: { auctionId },
  //     orderBy: { timestamp: 'desc' },
  //   });
  // }

  async getAuctionBids(auctionId: string) {
    return this.prisma.bid.findMany({
      where: { auctionId },
      orderBy: { amount: "desc" },
      include: {
        user: { select: { id: true, userName: true } }, 
      },
    });
  }
  @Cron("*/30 * * * * *")
  async updateAuctionStatus() {
    const now = new Date();
    console.log("⏰ Running auction scheduler at:", now.toISOString());

    // 1. Start PENDING auctions
    const activated = await this.prisma.auction.updateMany({
      where: {
        status: "PENDING",
        startTime: { lte: now },
        endTime: { gt: now },
      },
      data: { status: "ACTIVE" },
    });
    console.log(`🟢 Activated ${activated.count} auctions`);

    // 2. End ACTIVE auctions

    const completedAuctions = await this.prisma.auction.findMany({
      where: {
        status: "ACTIVE",
        endTime: { lte: now },
      },
    });

    // Step 3: Process each completed auction
    for (const auction of completedAuctions) {
      const highestBid = await this.prisma.bid.findFirst({
        where: { auctionId: auction.id },
        orderBy: { amount: "desc" },
      });

      await this.prisma.auction.update({
        where: { id: auction.id },
        data: {
          status: "COMPLETED",
          winnerId: highestBid?.userId?.toString() ?? null,
        },
      });

      console.log(
        `🏁 Auction ${auction.id} ended. Winner: ${
          highestBid?.userId ?? "No bids"
        }`
      );

      this.auctionGateway.broadcastAuctionEnded(
      auction.id,
      highestBid?.userId ?? null,
      highestBid?.amount ?? auction.currentHighest
    );
    }

    console.log(`🟢 Activated ${activated.count} auctions`);
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
}
