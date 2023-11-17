import { BlockUserController } from '@followers/controllers/block-user';
import { FollowUserController } from '@followers/controllers/follower-user';
import { GetFollowersController } from '@followers/controllers/get-followers';
import { UnFollowUserController } from '@followers/controllers/unfollow-user';
import { authMiddleware } from '@globals/middlewares/auth.middleware';
import express, { Router } from 'express';

class FollowerRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.use(authMiddleware.verifyUser);
    this.router.put('/user/follow/:followerId', authMiddleware.requireAuth, FollowUserController.addFollower);
    this.router.put('/user/unfollow/:followeeId/:followerId', authMiddleware.requireAuth, UnFollowUserController.unfollowUser);
    this.router.get('/user/following', authMiddleware.requireAuth, GetFollowersController.userFollowing);
    this.router.get('/user/followers/:userId', authMiddleware.requireAuth, GetFollowersController.userFollowers);
    this.router.put('/user/block/:followerId', authMiddleware.requireAuth, BlockUserController.block);
    this.router.put('/user/unblock/:followerId', authMiddleware.requireAuth, BlockUserController.unblock);
    return this.router;
  }
}

export const followerRoutes: FollowerRoutes = new FollowerRoutes();
