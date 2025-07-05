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
import { BidService } from 'src/bids/bid.service';

const connectionMap = new Map<string, number>(); // IP address => active connection count
const MAX_CONNECTIONS_PER_IP = 10;

@WebSocketGateway({ cors: true })
export class AuctionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly redisService: RedisService,
    private readonly bidService: BidService
  ) {}

  async handleConnection(client: Socket) {
    console.log('🔌 New WebSocket connection attempt...');
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

  // async handleDisconnect(client: Socket) {
  //   const ip = client.handshake.address;
  //   const current = connectionMap.get(ip) ?? 0;

  //   if (current <= 1) {
  //     connectionMap.delete(ip);
  //   } else {
  //     connectionMap.set(ip, current - 1);
  //   }

  //   const { auctionId, userId } = client.data || {};
  //   if (auctionId && userId) {
  //     await this.redisService.removeUserFromAuction(auctionId, userId);
  //     this.broadcastUserCount(auctionId);
  //   }

  //   console.log(`🔴 Client disconnected from IP ${ip}. Remaining: ${connectionMap.get(ip) ?? 0}`);
  // }

  // 🔹 Client joins auction room
  
  async handleDisconnect(client: Socket) {
    const ip = client.handshake.address;
    const currentConnections = connectionMap.get(ip) ?? 0;
  
    if (currentConnections <= 1) {
      connectionMap.delete(ip);
    } else {
      connectionMap.set(ip, currentConnections - 1);
    }
  
    const userId = client.data.userId;
  
    // ✅ Remove user from all auctions they joined
    if (client.data.auctions && userId) {
      for (const auctionId of client.data.auctions) {
        await this.redisService.removeUserFromAuction(auctionId, userId);
        this.broadcastUserCount(auctionId);
      }
    }
  
    console.log(`🔴 Client disconnected from IP ${ip}. Remaining: ${connectionMap.get(ip) ?? 0}`);
  }
  
  @SubscribeMessage('join-auction')
  async handleJoinAuction(
    @MessageBody() payload: { auctionId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { auctionId, userId } = payload;

    const room = `auction_${auctionId}`;

     // Initialize if missing
    if (!client.data.auctions) {
      client.data.auctions = new Set<string>();
    }

    // ✅ Prevent duplicate joins
    // if (client.rooms.has(room)) {
    //   return;
    // }
    if (client.data.auctions?.has(auctionId)) {
      return;
    }
    // ✅ Join the room
    client.join(room); 

    // ✅ Track multiple auctions per socket
    if (!client.data.auctions) {
      client.data.auctions = new Set<string>();
    }

    // client.data.auctionId = auctionId;
    client.data.auctions.add(auctionId);
    client.data.userId = userId;

    await this.redisService.addUserToAuction(auctionId, userId);
    this.broadcastUserCount(auctionId);

    // ✅ Confirm room join in server logs
    console.log(
    `[SOCKET] User ${userId} joined room "${room}" — all joined rooms:`,
    [...client.rooms]
    );
    

    client.emit('joined-auction', { auctionId, userId });


    
    // ✅ Notify everyone else in the room
    client.to(room).emit('user-joined', {
      auctionId,
      userId,
      message: `User ${userId} joined auction ${auctionId}`,
    });

    console.log(`[SOCKET] User ${userId} joined auction ${auctionId} (socketId: ${client.id})`);
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
    // console.log("==LOG== ~ AuctionGateway ~ broadcastUserCount ~ auctionId:", auctionId)
    const count = await this.redisService.countAuctionUsers(auctionId);
    this.server.to(`auction_${auctionId}`).emit('user-count', { auctionId, count });
  }

  @SubscribeMessage('place-bid')
async handlePlaceBid(
  @MessageBody() payload: { auctionId: string; userId: string; amount: number },
  @ConnectedSocket() client: Socket,
) {
  const { auctionId, userId, amount } = payload;

  try {
    const result = await this.bidService.placeBid(auctionId, Number(userId), amount);

    // Broadcast to others in the auction room
    this.broadcastBidUpdate(auctionId, {
      amount,
      bidderId: userId,
    });

    // Acknowledge only the user who placed the bid
    client.emit('bid-placed', { success: true, amount });

    this.broadcastUserBidCount(auctionId);
  } catch (err: any) {
    // Emit error only to the requesting user
    client.emit('bid-error', {
      success: false,
      message: err.message || 'Bid failed',
    });
  }
  }
  

  private async broadcastUserBidCount(auctionId: string) {
    // console.log("==LOG== ~ AuctionGateway ~ broadcastUserCount ~ auctionId:", auctionId)
    const count = await this.redisService.countBidUsers(auctionId);
    this.server.to(`auction_${auctionId}`).emit('bid-count', { auctionId, count });
  }

}

