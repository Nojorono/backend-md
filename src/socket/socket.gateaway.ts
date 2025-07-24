import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { decrypt } from 'src/helpers/nojorono.helpers';
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL_SOCKET,
    credentials: true,
    allowedHeaders: ['Content-Type'],
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private clientMap = new Map<string, string>(); // Maps client IDs to user IDs

  constructor(private readonly jwtService: JwtService) {
    // Set max listeners to avoid memory leak warning
    this.server?.sockets?.setMaxListeners(0);
  }

  handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    // Set max listeners for individual socket
    client.setMaxListeners(0);

    const token = client.handshake.auth.token;

    if (token) {
      try {
        const decoded = this.jwtService.verify(token);
        const userId = decoded.id;
        this.clientMap.set(client.id, userId);
        console.log(`Client connected: ${client.id}`);
      } catch (error) {
        console.error('Authentication error:', error);
        client.disconnect(); // Optionally disconnect the client if the token is invalid
      }
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.clientMap.delete(client.id);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: string): void {
    console.log(`Message from ${client.id}: ${payload}`);
    this.server.emit('message', payload);
  }

  public notifyBroadcast(userId: number, payload: any) {
    for (const [clientId, uid] of this.clientMap.entries()) {
      const decryptedId = decrypt(uid);
      if (decryptedId == userId) {
        this.server.to(clientId).emit('notification', payload);
      }
    }
  }
}
