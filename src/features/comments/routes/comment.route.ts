import { AddCommentController } from '@comments/controllers/add-comment';
import { GetCommentsController } from '@comments/controllers/get-comments';
import { authMiddleware } from '@globals/middlewares/auth.middleware';
import express, { Router } from 'express';

class CommentRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.use(authMiddleware.verifyUser);
    this.router.route('/post/comment').post(authMiddleware.requireAuth, AddCommentController.addComment);
    this.router.route('/post/comments/:postId').get(authMiddleware.requireAuth, GetCommentsController.getComments);
    this.router.route('/post/commentsnames/:postId').get(authMiddleware.requireAuth, GetCommentsController.getCommentsNames);
    this.router.route('/post/single/comment/:postId/:commentId').get(authMiddleware.requireAuth, GetCommentsController.getSingleComment);
    return this.router;
  }
}

export const commentRoutes = new CommentRoutes();
