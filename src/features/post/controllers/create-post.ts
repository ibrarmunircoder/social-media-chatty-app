import { zodValidation } from '@globals/decorators/zod-validation.decorator';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostInput, PostWithImageInput, postSchema, postWithImageSchema } from '@post/schemes/post';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { PostCache } from '@services/redis/post.cache';
import { socketIOPostObject } from '@sockets/post';
import { postQueue } from '@services/queues/post.queue';
import { uploads } from '@globals/helpers/cloudinary-uploads';
import { BadRequestError } from '@globals/helpers/error-handler';
import { imageQueue } from '@services/queues/image.queue';

const postCache: PostCache = new PostCache();

export class CreatePostController {
  @zodValidation(postSchema)
  public static async createPost(req: Request<unknown, unknown, PostInput>, res: Response): Promise<void> {
    const { bgColor, feelings, gifUrl, post, privacy, profilePicture } = req.body;
    const postObjectId = new ObjectId();

    const postDocumentPayload = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      feelings,
      bgColor,
      privacy,
      gifUrl,
      commentsCount: 0,
      imgVersion: '',
      imgId: '',
      createdAt: new Date(),
      reactions: {
        like: 0,
        angry: 0,
        happy: 0,
        wow: 0,
        love: 0,
        sad: 0
      }
    } as IPostDocument;

    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: req.currentUser!.userId,
      uId: req.currentUser!.uId,
      postData: postDocumentPayload
    });
    socketIOPostObject.emit('add post', postDocumentPayload);
    postQueue.addPostJob('addPostToDb', { key: req.currentUser!.userId, value: postDocumentPayload });
    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully' });
  }
  @zodValidation(postWithImageSchema)
  public static async createPostWithImage(req: Request<unknown, unknown, PostWithImageInput>, res: Response): Promise<void> {
    const { bgColor, feelings, gifUrl, post, privacy, profilePicture, image } = req.body;
    const postObjectId = new ObjectId();

    const result = await uploads(image);
    if (!result?.public_id) {
      throw new BadRequestError(result?.message || 'File Upload error');
    }

    const postDocumentPayload = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      feelings,
      bgColor,
      privacy,
      gifUrl,
      commentsCount: 0,
      imgVersion: result.version,
      imgId: result.public_id,
      createdAt: new Date(),
      reactions: {
        like: 0,
        angry: 0,
        happy: 0,
        wow: 0,
        love: 0,
        sad: 0
      }
    } as IPostDocument;

    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: req.currentUser!.userId,
      uId: req.currentUser!.uId,
      postData: postDocumentPayload
    });
    socketIOPostObject.emit('add post', postDocumentPayload);
    postQueue.addPostJob('addPostToDb', { key: req.currentUser!.userId, value: postDocumentPayload });
    imageQueue.addImageJob('addImageToDB', {
      key: `${req.currentUser!.userId}`,
      imgId: result.public_id,
      imgVersion: result.version.toString()
    });
    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created with image successfully' });
  }
}
