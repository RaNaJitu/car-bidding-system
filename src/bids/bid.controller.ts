import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { BidService } from './bid.service';
import { ApiTags, ApiBody } from '@nestjs/swagger';

@ApiTags('Bids') // Group routes in Swagger UI
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
  async placeBid(
    @Body() body: { auctionId: string; userId: number; amount: number },
  ) {
    const { auctionId, userId, amount } = body;
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
