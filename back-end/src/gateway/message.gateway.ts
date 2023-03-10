import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Message } from '../models/message.entity';
import { Room } from '../models/room.entity';
import { Participant } from '../models/participant.entity';
import { NestGateway } from '@nestjs/websockets/interfaces/nest-gateway.interface';
import { Bind, UseInterceptors } from '@nestjs/common';
import { MessageService } from '../services/message.service';
import { ParticipantService } from '../services/participant.service';
import { RoomService } from '../services/room.service';
import { Logger, Body } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { MessageDto } from '../dtos/in/message.dto';
import { RoomDto } from '../dtos/in/room.dto';
import { RoomSnippetDto } from '../dtos/out/RoomSnippetDto.dto';
import { UserService } from '../services/user.service';


/*this declarator gives us access to the socket.io functionality*/
@WebSocketGateway({
  cors: {
    origin: true,
  },
})
export class MessageGateway {
  /*gives us access to the websockets server instance*/
  @WebSocketServer() server: Server;

	constructor
	(private readonly messageService: MessageService,
	private readonly userService: UserService,
) {}

  @Bind(MessageBody(), ConnectedSocket()) // useful?
  @SubscribeMessage('createMessage')
	async createMessage(@Body() message: MessageDto): Promise<void> {
	    var value = await this.messageService.createMessage(message);

		/*Send message_id to front
		  this.server.emit('SendMsg', value);*/
		/*Send message infos to everyone in the same channel*/
    this.server
      .to(message.channelIdDst.toString())
		.emit('MsgtoChat', value);
	}

}
