import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { NestGateway } from '@nestjs/websockets/interfaces/nest-gateway.interface';
import { Bind, UseInterceptors } from '@nestjs/common';
import { Logger, Body } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

import { Matchmaking } from '../models/matchmaking.entity'
import { PongDto } from '../dtos/in/pong.dto';
import { PongService } from '../services/pong.service';
import { moveDto } from 'src/dtos/in/move.dto';
import { GameEntity } from 'src/models/game.entity';
import { lookingForAGameDto } from 'src/dtos/in/lookingForAGame.dto';
import { createCustomGameDto } from 'src/dtos/in/createCustomGame.dto';
import { joinPongRoomDto } from 'src/dtos/in/joinPongRoom.dto';
import { UserService } from 'src/services/user.service';

/*this declarator gives us access to the socket.io functionality*/
@WebSocketGateway({ path: '/pongSocketServer', cors: { origin: true }})
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
  constructor(private readonly pongService: PongService, private userService: UserService) {}

  @WebSocketServer() server: Server;

  afterInit(server: Server) {}

  handleConnection(client: Socket) {}


  handleDisconnect(client: Socket) {

    this.pongService.handleDisconnect(client);
  }

  @SubscribeMessage('setSocketId')
  async setSocketId(socket: Socket, username: string) : Promise<string> {

    return await this.pongService.setSocketId(socket, username);
  }

	@SubscribeMessage('lookingForAGame') 
    async lookingForplay(socket: Socket, data: lookingForAGameDto) : Promise<void> {

		let value = await this.pongService.managePlayer(socket, this.server, data.userId, data.difficulty, data.maxScore);
	}

  @SubscribeMessage('iDontWannaPlayAnymore')
  iDontWannaPlayAnymore(socket: Socket, userId: number) {
    this.pongService.iDontWannaPlayAnymore(socket, userId);
  }

  // @SubscribeMessage('createCustomGame')
  // async createCustomGame(client: Socket, data: createCustomGameDto) {

  //     const roomId: string = await this.pongService.createCustomGame(client, data.userId, data.difficulty, data.maxScore);
  //     this.server.to(client.id).emit('customGameId', roomId);
  // }

	@SubscribeMessage('joinPongRoom')
	async join(socket: Socket, data: joinPongRoomDto): Promise<void> {

    this.pongService.joinPongRoom(socket, this.server, data.userId, data.roomId);
    }

	@SubscribeMessage('move')
	async moveAction(socket: Socket, move: GameEntity): Promise<void> {

    await this.pongService.registerMove(move);
	}

}
