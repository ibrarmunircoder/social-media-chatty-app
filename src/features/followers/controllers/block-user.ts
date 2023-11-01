import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { FollowerCache } from '@services/redis/follower.cache';
import { blockedUserQueue } from '@services/queues/block.queue';

const followerCache: FollowerCache = new FollowerCache();

export class BlockUserController {
  public static async block(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;
    BlockUserController.updateBlockedUser(followerId, req.currentUser!.userId, 'block');
    blockedUserQueue.addBlockedUserJob('addBlockedUserToDB', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${followerId}`,
      type: 'block'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'User blocked' });
  }

  public static async unblock(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;
    BlockUserController.updateBlockedUser(followerId, req.currentUser!.userId, 'unblock');
    blockedUserQueue.addBlockedUserJob('removeBlockedUserFromDB', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${followerId}`,
      type: 'unblock'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'User unblocked' });
  }

  private static async updateBlockedUser(followerId: string, userId: string, type: 'block' | 'unblock'): Promise<void> {
    const blocked: Promise<void> = followerCache.updateBlockedUserPropInCache(`${userId}`, 'blocked', `${followerId}`, type);
    const blockedBy: Promise<void> = followerCache.updateBlockedUserPropInCache(`${followerId}`, 'blockedBy', `${userId}`, type);
    await Promise.all([blocked, blockedBy]);
  }
}
