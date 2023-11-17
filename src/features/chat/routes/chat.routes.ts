import { AddChatMessageController } from '@chat/controllers/add-chat-message';
import { AddMessageReactionController } from '@chat/controllers/add-message-reaction';
import { DeleteChatMessageController } from '@chat/controllers/delete-chat-message';
import { GetChatMessagesController } from '@chat/controllers/get-chat-messages';
import { UpdateChatMessageController } from '@chat/controllers/update-chat-message';
import { authMiddleware } from '@globals/middlewares/auth.middleware';
import express, { Router } from 'express';

class ChatRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.use(authMiddleware.verifyUser);
    this.router.post('/chat/message', authMiddleware.requireAuth, AddChatMessageController.message);
    this.router.post('/chat/message/add-chat-users', authMiddleware.requireAuth, AddChatMessageController.addChatUsers);
    this.router.post('/chat/message/remove-chat-users', authMiddleware.requireAuth, AddChatMessageController.removeChatUsers);
    this.router.get('/chat/message/conversation-list', authMiddleware.requireAuth, GetChatMessagesController.conversationList);
    this.router.get('/chat/message/user/:receiverId', authMiddleware.requireAuth, GetChatMessagesController.messages);
    this.router.put('/chat/message/mark-as-read', authMiddleware.requireAuth, UpdateChatMessageController.message);
    this.router.put('/chat/message/reaction', authMiddleware.requireAuth, AddMessageReactionController.reaction);
    this.router.delete(
      '/chat/message/mark-as-deleted/:messageId/:senderId/:receiverId/:type',
      authMiddleware.requireAuth,
      DeleteChatMessageController.markMessageAsDeleted
    );
    return this.router;
  }
}

export const chatRoutes = new ChatRoutes();
