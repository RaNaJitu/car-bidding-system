import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface JoinAuctionPayload {
  auctionId: string;
}

interface BidUpdatePayload {
  userId: number;
  amount: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class BidGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  afterInit() {
    console.log('✅ WebSocket Gateway Initialized');
  }

  // 🔄 Emits bid updates to a specific auction room
  sendBidUpdate(auctionId: string, bid: BidUpdatePayload) {
    this.server.to(auctionId).emit('bidUpdate', bid);
    console.log(`📡 Emitted bid update to auction ${auctionId}:`, bid);
  }

  // 🧠 Handles client joining an auction room
  @SubscribeMessage('joinAuction')
  handleJoinAuction(
    @MessageBody() data: JoinAuctionPayload,
    @ConnectedSocket() client: Socket,
  ) {
    const { auctionId } = data;

    if (!auctionId) {
      client.emit('error', 'Auction ID is required to join room');
      return;
    }

    client.join(auctionId);
    client.emit('joinedAuction', `🟢 Joined auction room: ${auctionId}`);
    console.log(`👤 Client ${client.id} joined auction room ${auctionId}`);
  }
}
