// import { Module } from '@nestjs/common';
// import { AuctionService } from './auction.service';
// // import { AuctionGateway } from './auction.gateway';
// import { PrismaModule } from '../prisma/prisma.module';
// import { AuctionController } from './auction.controller';

// @Module({
//   imports: [PrismaModule],
// //   providers: [AuctionService, AuctionGateway],
//   controllers: [AuctionController],
//   providers: [AuctionService],
//   exports: [AuctionService],
// })
// export class AuctionModule {}


import { Module } from '@nestjs/common';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BidModule } from '../bids/bid.module';
import { AuctionGateway } from './auction.gateway';

@Module({
  imports: [
    PrismaModule,
    BidModule
  ],
  controllers: [AuctionController],
  providers: [AuctionService, AuctionGateway],
  exports: [AuctionService],
})
export class AuctionModule {}


