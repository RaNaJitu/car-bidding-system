import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class BidGateway implements OnGatewayInit {
  @WebSocketServer()
  server!: Server;

  afterInit() {
    console.log('WebSocket Gateway Initialized');
  }

  sendBidUpdate(auctionId: string, bid: any) {
    this.server.to(auctionId).emit('bidUpdate', bid);
  }

  @SubscribeMessage('joinAuction')
  handleJoinAuction(
    @MessageBody() data: { auctionId: string },
    @ConnectedSocket() client: Socket
  ) {
    client.join(data.auctionId);
    client.emit('joinedAuction', `Joined auction room: ${data.auctionId}`);
    console.log(`Client ${client.id} joined auction ${data.auctionId}`);
  }
}
