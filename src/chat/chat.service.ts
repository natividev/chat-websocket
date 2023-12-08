import { Injectable } from '@nestjs/common';

interface Client {
  id: string;
  name: string;
  date?: Date;
  text?: string;
}

@Injectable()
export class ChatService {
  private clients: Record<string, Client> = {};

  onClientConnect(client: Client) {
    this.clients[client.id] = client;
  }

  onClientDisconnect(id: string) {
    delete this.clients[id];
  }

  getClient() {
    return Object.values(this.clients);
  }
}
