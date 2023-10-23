import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { zodValidation } from '@globals/decorators/zod-validation.decorator';
import { AddReactionInput, addReactionSchema } from '@reactions/schemes/reactions';
import { ReactionCache } from '@services/redis/reaction.cache';
import { ObjectId } from 'mongodb';
import { IReactionDocument, IReactionJob } from '@reactions/interfaces/reaction.interface';
import { reactionQueue } from '@services/queues/reaction.queue';

const reactionCache: ReactionCache = new ReactionCache();

export class AddReactionController {
  @zodValidation(addReactionSchema)
  public static async addReaction(req: Request<unknown, unknown, AddReactionInput>, res: Response): Promise<void> {
    const { userTo, postId, type, previousReaction, postReactions, profilePicture } = req.body;
    const reactionObject: IReactionDocument = {
      _id: new ObjectId(),
      postId,
      type,
      avataColor: req.currentUser!.avatarColor,
      username: req.currentUser!.username,
      profilePicture
    } as IReactionDocument;
    await reactionCache.savePostReactionToCache(postId, reactionObject, postReactions, type, previousReaction);
    const databaseReactionData: IReactionJob = {
      postId,
      userTo,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      type,
      previousReaction,
      reactionObject
    };
    reactionQueue.addReactionJob('addReactionToDB', databaseReactionData);
    res.status(HTTP_STATUS.OK).json({ message: 'Reaction added successfully' });
  }
}
