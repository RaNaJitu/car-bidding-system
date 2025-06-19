import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Get,
  Param,
  BadRequestException,
  NotFoundException,
  Query,
} from "@nestjs/common";
import { BidService } from "src/bids/bid.service";
import { AuctionService } from "./auction.service";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateAuctionDto } from "./dto/create-auction.dto";
import { PrismaService } from "src/prisma/prisma.service";

@ApiTags('Auctions')
// @ApiBearerAuth('access-tokenß')
@Controller("auctions")
export class AuctionController {
  constructor(
    private readonly auctionService: AuctionService,
    private readonly bidService: BidService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new auction' })
  @ApiResponse({ status: 201, description: 'Auction created successfully' })
  @ApiBody({ type: CreateAuctionDto })
  async createAuction(
    @Body()
    body: {
      carId: string;
      startTime: string;
      endTime: string;
      startingBid: number;
    }
  ) {
    const { carId, startTime, endTime, startingBid } = body;

    return await this.auctionService.createAuction({
      carId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      startingBid,
    });
  }

  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all auctions with bids' })
  async getAll() {
    return await this.auctionService.getAllAuctions();
  }

  @Get(":id/bids")
  @ApiBearerAuth('access-token')
   @ApiOperation({ summary: 'Get all bids for a specific auction' })
  async getBids(@Param("id") auctionId: string) {
    return await this.auctionService.getAuctionBids(auctionId);
  }

  @Get(":id/highestBid")
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get the highest bid for a specific auction' })
  async getHighestBid(@Param("id") auctionId: string) {
    console.log(
      "🚀 ~ AuctionController ~ getHighestBid ~ auctionId:",
      auctionId
    );
    return await this.bidService.getCurrentHighestBid(auctionId);
  }

  @Get(':id/winner')
  @ApiBearerAuth('access-token')
async getAuctionWinner(@Param('id') auctionId: string) {
  const auction = await this.auctionService.getAuctionById(auctionId);

  if (!auction) {
    throw new NotFoundException('Auction not found');
  }

  if (auction.status !== 'COMPLETED') {
    throw new BadRequestException('Auction is not yet completed');
  }

  const winner = await this.prisma.user.findUnique({
    where: { id: Number(auction.winnerId) },
    select: { id: true, userName: true },
  });

  return {
    auctionId: auction.id,
    winner: winner ?? 'Winner not found',
    winningAmount: auction.currentHighest,
  };
}

@Get(':auctionId/bids')
@ApiBearerAuth('access-token')
  async getBidHistory(@Param('auctionId') auctionId: string) {
    return this.auctionService.getAuctionBids(auctionId);
  }


  @Get(':auctionId/leaderboard')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get bid history for an auction' })
  @ApiParam({ name: 'auctionId', type: String })
  @ApiResponse({ status: 200, description: 'List of bids' })
  async getLeaderboard(
    @Param('auctionId') auctionId: string,
    @Query('top') top: number = 10, // optional, default top 10
  ) {
    return this.auctionService.getLeaderboard(auctionId, top);
  }

}
