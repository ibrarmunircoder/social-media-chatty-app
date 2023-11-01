import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';
import { FollowerCache } from '@services/redis/follower.cache';
import { IFollowerData } from '@followers/interfaces/follower.interface';
import mongoose from 'mongoose';
import { followerService } from '@services/db/follower.service';

const followerCache: FollowerCache = new FollowerCache();

export class GetFollowersController {
  public static async userFollowing(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.currentUser!.userId);
    const cachedFollowees: IFollowerData[] = await followerCache.getFollowersFromCache(`following:${req.currentUser!.userId}`);
    const following: IFollowerData[] = cachedFollowees.length ? cachedFollowees : await followerService.getFolloweeData(userObjectId);
    res.status(HTTP_STATUS.OK).json({ message: 'User following', following });
  }

  public static async userFollowers(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.params.userId);
    const cachedFollowers: IFollowerData[] = await followerCache.getFollowersFromCache(`followers:${req.params.userId}`);
    const followers: IFollowerData[] = cachedFollowers.length ? cachedFollowers : await followerService.getFollowerData(userObjectId);
    res.status(HTTP_STATUS.OK).json({ message: 'User followers', followers });
  }
}
