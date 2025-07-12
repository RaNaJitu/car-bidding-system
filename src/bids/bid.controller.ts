import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Request  } from '@nestjs/common';
import { BidService } from './bid.service';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtBlacklistGuard } from 'src/auth/jwt-blacklist.guard';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
// import { Throttle } from '@nestjs/throttler';

@ApiTags('Bids')
@ApiBearerAuth('access-token')
@UseGuards(JwtBlacklistGuard)
@Controller('bids')
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Post()
  @ApiBody({ schema: {
    type: 'object',
    properties: {
      auctionId: { type: 'string' },
      userId: { type: 'number' },
      amount: { type: 'number' },
    },
    required: ['auctionId', 'userId', 'amount']
  }})
    // @Throttle(3, 10)
    @UseGuards(JwtAuthGuard)
  async placeBid(
    @Request() req,
    @Body() body: { auctionId: string; userId: number; amount: number },
  ) {
    const user = req.sub;
    console.log("==LOG== authorization:", req.authorization)
    console.log("==LOG== user:", req.user)
    const { userId, userName } = req.user;
    const { auctionId, amount } = body;
    console.log('Incoming Bid:---->', body);

    try {
    const bid = await this.bidService.placeBidWithRetry(auctionId, userId, amount);
    return { status: 'success', bid };
  } catch (error: any) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }

    // try {
    //   const bid = await this.bidService.placeBid(auctionId, userId, amount);
    //   return { status: 'success', bid };
    // } catch (error: any) {
    //   throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    // }
  }
}
