// // src/auctions/auction.gateway.ts
// import {
//   WebSocketGateway,
//   WebSocketServer,
// } from '@nestjs/websockets';
// import { Server } from 'socket.io';

// @WebSocketGateway()
// export class AuctionGateway {
//   @WebSocketServer()
//   server!: Server;

//   broadcastAuctionEnded(auctionId: string, winnerId: number | null, amount: number) {
//     this.server.emit('auction-ended', {
//       auctionId,
//       winnerId,
//       winningAmount: amount,
//     });
//   }
// }


import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class AuctionGateway {
  @WebSocketServer()
  server!: Server;

  // 🔹 Client joins auction room
  @SubscribeMessage('join-auction')
  handleJoinAuction(
    @MessageBody() auctionId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`auction_${auctionId}`);
    client.emit('joined-auction', { auctionId });
  }

  // 🔹 Broadcast bid updates to specific auction room
  broadcastBidUpdate(auctionId: string, data: any) {
    this.server.to(`auction_${auctionId}`).emit('bidUpdate', data);
  }

  // 🔹 Broadcast auction ended event to specific room
  broadcastAuctionEnded(auctionId: string, winnerId: string | null, amount: number) {
    this.server.to(`auction_${auctionId}`).emit('auction-ended', {
      auctionId,
      winnerId,
      winningAmount: amount,
    });
  }
  
}
