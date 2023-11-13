import { authRoutes } from '@auth/routes/authRoutes';
import { chatRoutes } from '@chat/routes/chat.routes';
import { commentRoutes } from '@comments/routes/comment.route';
import { followerRoutes } from '@followers/routes/follower-user';
import { imageRoutes } from '@images/routes/image.routes';
import { notificationRoutes } from '@notifications/routes/notification';
import { postRoutes } from '@post/routes/post.routes';
import { reactionRoutes } from '@reactions/routes/reaction.route';
import { serverAdapter } from '@services/queues/base.queue';
import { Application } from 'express';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, postRoutes.routes());
    app.use(BASE_PATH, reactionRoutes.routes());
    app.use(BASE_PATH, commentRoutes.routes());
    app.use(BASE_PATH, followerRoutes.routes());
    app.use(BASE_PATH, notificationRoutes.routes());
    app.use(BASE_PATH, imageRoutes.routes());
    app.use(BASE_PATH, chatRoutes.routes());
  };
  routes();
};
