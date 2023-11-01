import { authRoutes } from '@auth/routes/authRoutes';
import { commentRoutes } from '@comments/routes/comment.route';
import { followerRoutes } from '@followers/routes/follower-user';
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
  };
  routes();
};
