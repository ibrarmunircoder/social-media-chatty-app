import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { zodValidation } from '@globals/decorators/zod-validation.decorator';
import { ObjectId } from 'mongodb';
import { addCommentSchema } from '@comments/schemes/comments';
import { CommentCache } from '@services/redis/comment.cache';
import { commentQueue } from '@services/queues/comment.queue';
import { ICommentDocument, ICommentJob } from '@comments/interfaces/comment.interface';

const commentCache: CommentCache = new CommentCache();

export class AddCommentController {
  @zodValidation(addCommentSchema)
  public static async addComment(req: Request, res: Response): Promise<void> {
    const { userTo, postId, profilePicture, comment } = req.body;
    const commentObjectId: ObjectId = new ObjectId();
    const commentData: ICommentDocument = {
      _id: commentObjectId,
      postId,
      username: `${req.currentUser?.username}`,
      avatarColor: `${req.currentUser?.avatarColor}`,
      profilePicture,
      comment,
      createdAt: new Date()
    } as ICommentDocument;
    await commentCache.savePostCommentToCache(postId, JSON.stringify(commentData));

    const databaseCommentData: ICommentJob = {
      postId,
      userTo,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      comment: commentData
    };
    commentQueue.addCommentJob('addCommentToDB', databaseCommentData);
    res.status(HTTP_STATUS.OK).json({ message: 'Comment added successfully' });
  }
}
