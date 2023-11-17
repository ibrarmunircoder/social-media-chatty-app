import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { ReactionCache } from '@services/redis/reaction.cache';
import { IReactionJob } from '@reactions/interfaces/reaction.interface';
import { reactionQueue } from '@services/queues/reaction.queue';

const reactionCache: ReactionCache = new ReactionCache();

export interface IRemoveReactionParams {
  postId: string;
  previousReaction: string;
  postReactions: string;
}

export class RemoveReactionController {
  public static async removeReaction(req: Request<IRemoveReactionParams, unknown, unknown>, res: Response): Promise<void> {
    const { postId, previousReaction, postReactions } = req.params;
    await reactionCache.removePostReactionFromCache(postId, `${req.currentUser!.username}`, JSON.parse(postReactions));
    const databaseReactionData: IReactionJob = {
      postId,
      username: req.currentUser!.username,
      previousReaction
    };
    reactionQueue.addReactionJob('removeReactionFromDB', databaseReactionData);
    res.status(HTTP_STATUS.OK).json({ message: 'Reaction removed from post' });
  }
}
