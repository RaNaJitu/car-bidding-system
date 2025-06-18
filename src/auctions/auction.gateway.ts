// src/auctions/auction.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class AuctionGateway {
  @WebSocketServer()
  server!: Server;

  broadcastAuctionEnded(auctionId: string, winnerId: number | null, amount: number) {
    this.server.emit('auction-ended', {
      auctionId,
      winnerId,
      winningAmount: amount,
    });
  }
}
