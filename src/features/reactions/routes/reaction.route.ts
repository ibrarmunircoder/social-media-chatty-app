import { authMiddleware } from '@globals/middlewares/auth.middleware';
import { AddReactionController } from '@reactions/controllers/add-reaction';
import { GetReactionsController } from '@reactions/controllers/get-reaction';
import { RemoveReactionController } from '@reactions/controllers/remove-reaction';
import express, { Router } from 'express';

class ReactionRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.use(authMiddleware.verifyUser);
    this.router.route('/post/reactions/:postId').get(authMiddleware.requireAuth, GetReactionsController.getReactions);
    this.router
      .route('/post/single/reactions/:username/:postId')
      .get(authMiddleware.requireAuth, GetReactionsController.getSingleReactionByUsername);
    this.router.route('/post/reactions/username/:username/').get(authMiddleware.requireAuth, GetReactionsController.getReactionsByUsername);
    this.router.route('/post/reaction').post(authMiddleware.requireAuth, AddReactionController.addReaction);
    this.router
      .route('/post/reaction/:postId/:previousReaction/:postReactions')
      .delete(authMiddleware.requireAuth, RemoveReactionController.removeReaction);

    return this.router;
  }
}

export const reactionRoutes = new ReactionRoutes();
