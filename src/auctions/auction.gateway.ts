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


// import {
//   WebSocketGateway,
//   WebSocketServer,
//   SubscribeMessage,
//   MessageBody,
//   ConnectedSocket,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';

// @WebSocketGateway()
// export class AuctionGateway {
//   @WebSocketServer()
//   server!: Server;

//   // 🔹 Client joins auction room
//   @SubscribeMessage('join-auction')
//   handleJoinAuction(
//     @MessageBody() auctionId: string,
//     @ConnectedSocket() client: Socket,
//   ) {
//     client.join(`auction_${auctionId}`);
//     client.emit('joined-auction', { auctionId });
//   }

//   // 🔹 Broadcast bid updates to specific auction room
//   broadcastBidUpdate(auctionId: string, data: any) {
//     this.server.to(`auction_${auctionId}`).emit('bidUpdate', data);
//   }

//   // 🔹 Broadcast auction ended event to specific room
//   broadcastAuctionEnded(auctionId: string, winnerId: string | null, amount: number) {
//     this.server.to(`auction_${auctionId}`).emit('auction-ended', {
//       auctionId,
//       winnerId,
//       winningAmount: amount,
//     });
//   }
  
// }



// import {
//   WebSocketGateway,
//   WebSocketServer,
//   SubscribeMessage,
//   MessageBody,
//   ConnectedSocket,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';

// const connectionMap = new Map<string, number>(); // IP address => active connections count
// const MAX_CONNECTIONS_PER_IP = 3;

// @WebSocketGateway()
// export class AuctionGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer()
//   server!: Server;

//   handleConnection(client: Socket) {
//     const ip = client.handshake.address;

//     const currentConnections = connectionMap.get(ip) ?? 0;
//     if (currentConnections >= MAX_CONNECTIONS_PER_IP) {
//       client.disconnect(true);
//       console.log(`Connection rejected for IP ${ip}: max connections reached.`);
//       return;
//     }

//     connectionMap.set(ip, currentConnections + 1);
//     console.log(`Client connected from IP ${ip}. Active connections: ${connectionMap.get(ip)}`);
//   }

//   handleDisconnect(client: Socket) {
//     const ip = client.handshake.address;
//     const currentConnections = connectionMap.get(ip) ?? 0;

//     if (currentConnections <= 1) {
//       connectionMap.delete(ip);
//     } else {
//       connectionMap.set(ip, currentConnections - 1);
//     }

//     console.log(`Client disconnected from IP ${ip}. Active connections: ${connectionMap.get(ip) ?? 0}`);
//   }

//   // 🔹 Client joins auction room
//   @SubscribeMessage('join-auction')
//   handleJoinAuction(
//     @MessageBody() auctionId: string,
//     @ConnectedSocket() client: Socket,
//   ) {
//     client.join(`auction_${auctionId}`);
//     client.emit('joined-auction', { auctionId });
//   }

//   // 🔹 Broadcast bid updates to specific auction room
//   broadcastBidUpdate(auctionId: string, data: any) {
//     this.server.to(`auction_${auctionId}`).emit('bidUpdate', data);
//   }

//   // 🔹 Broadcast auction ended event to specific room
//   broadcastAuctionEnded(auctionId: string, winnerId: string | null, amount: number) {
//     this.server.to(`auction_${auctionId}`).emit('auction-ended', {
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
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from 'src/redis/redis.service';

const connectionMap = new Map<string, number>(); // IP address => active connection count
const MAX_CONNECTIONS_PER_IP = 3;

@WebSocketGateway({ cors: true })
export class AuctionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly redisService: RedisService) {}

  async handleConnection(client: Socket) {
    const ip = client.handshake.address;
    const current = connectionMap.get(ip) ?? 0;

    if (current >= MAX_CONNECTIONS_PER_IP) {
      console.warn(`🚫 IP ${ip} exceeded limit. Disconnecting...`);
      client.disconnect(true);
      return;
    }

    connectionMap.set(ip, current + 1);
    console.log(`🟢 Client connected from IP ${ip}. Count: ${current + 1}`);
  }

  async handleDisconnect(client: Socket) {
    const ip = client.handshake.address;
    const current = connectionMap.get(ip) ?? 0;

    if (current <= 1) {
      connectionMap.delete(ip);
    } else {
      connectionMap.set(ip, current - 1);
    }

    const { auctionId, userId } = client.data || {};
    if (auctionId && userId) {
      await this.redisService.removeUserFromAuction(auctionId, userId);
      this.broadcastUserCount(auctionId);
    }

    console.log(`🔴 Client disconnected from IP ${ip}. Remaining: ${connectionMap.get(ip) ?? 0}`);
  }

  // 🔹 Client joins auction room
  @SubscribeMessage('join-auction')
  async handleJoinAuction(
    @MessageBody() payload: { auctionId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { auctionId, userId } = payload;

    client.join(`auction_${auctionId}`);
    client.data.auctionId = auctionId;
    client.data.userId = userId;

    await this.redisService.addUserToAuction(auctionId, userId);
    this.broadcastUserCount(auctionId);

    client.emit('joined-auction', { auctionId });
  }

  // 🔹 Broadcast bid updates to specific auction room
  broadcastBidUpdate(auctionId: string, data: any) {
    this.server.to(`auction_${auctionId}`).emit('bidUpdate', data);
  }

  // 🔹 Broadcast auction ended event
  broadcastAuctionEnded(auctionId: string, winnerId: string | null, amount: number) {
    this.server.to(`auction_${auctionId}`).emit('auction-ended', {
      auctionId,
      winnerId,
      winningAmount: amount,
    });
  }

  // 🔹 Broadcast live user count for auction
  private async broadcastUserCount(auctionId: string) {
    const count = await this.redisService.countAuctionUsers(auctionId);
    this.server.to(`auction_${auctionId}`).emit('user-count', { auctionId, count });
  }
}

