import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Client } from 'socket.io/dist/client';

@WebSocketGateway()
export class ChatGateway implements OnModuleInit {
  @WebSocketServer()
  public server: Server;

  constructor(private readonly chatService: ChatService) { }

  onModuleInit() {
    this.server.on('connection', (socket: Socket) => {
      const { name, token } = socket.handshake.auth;

      if (!name) {
        socket.disconnect();
        return;
      }

      // Agregar al cliente al listado
      this.chatService.onClientConnect({ id: socket.id, name: name });

      // Mensaje de bienvenida
      // socket.emit('welcome-message', {
      //   id: socket.id,
      //   text: `Bienvenido ${name}`,
      //   date: new Date(),
      //   name,
      // });

      // Listado de clientes
      this.server.emit('on-clients-changed', this.chatService.getClient());

      socket.on('disconnect', () => {
        this.chatService.onClientDisconnect(socket.id);
        this.server.emit('on-clients-changed', this.chatService.getClient());
      });
    });
  }

  @SubscribeMessage('send-message')
  handleMessage(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ) {
    const { name, token } = client.handshake.auth;

    if (!message) {
      return;
    }

    this.server.emit('on-message', {
      userId: client.id,
      message: message,
      name: name,
    });
  }
}
