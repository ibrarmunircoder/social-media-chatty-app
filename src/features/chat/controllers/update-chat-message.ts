import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { MessageCache } from '@services/redis/message.cache';
import { IMessageData } from '@chat/interfaces/chat.interface';
import { socketIOChatObject } from '@sockets/chat';
import { chatQueue } from '@services/queues/chat.queue';
import { zodValidation } from '@globals/decorators/zod-validation.decorator';
import { markChatSchema } from '@chat/schemes/chat';

const messageCache: MessageCache = new MessageCache();

export class UpdateChatMessageController {
  @zodValidation(markChatSchema)
  public static async message(req: Request, res: Response): Promise<void> {
    const { senderId, receiverId } = req.body;
    const updatedMessage: IMessageData = await messageCache.updateChatMessages(`${senderId}`, `${receiverId}`);
    socketIOChatObject.emit('message read', updatedMessage);
    socketIOChatObject.emit('chat list', updatedMessage);
    chatQueue.addChatJob('markMessagesAsReadInDB', {
      senderId: new mongoose.Types.ObjectId(senderId),
      receiverId: new mongoose.Types.ObjectId(receiverId)
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Message marked as read' });
  }
}
