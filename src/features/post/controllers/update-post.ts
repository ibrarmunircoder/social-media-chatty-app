import { zodValidation } from '@globals/decorators/zod-validation.decorator';
import { uploads } from '@globals/helpers/cloudinary-uploads';
import { BadRequestError } from '@globals/helpers/error-handler';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostInput, PostWithImageInput, postSchema, postWithImageSchema } from '@post/schemes/post';
import { imageQueue } from '@services/queues/image.queue';
import { postQueue } from '@services/queues/post.queue';
import { PostCache } from '@services/redis/post.cache';
import { socketIOPostObject } from '@sockets/post';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

const postCache: PostCache = new PostCache();

export class UpdatePostController {
  @zodValidation(postSchema)
  public static async updatePost(req: Request<{ postId: string }, unknown, PostInput>, res: Response): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imageId, profilePicture } = req.body;
    const { postId } = req.params;
    const updatedPost = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId: imageId,
      imgVersion
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated });
    res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
  }

  @zodValidation(postWithImageSchema)
  public static async updatePostWithImage(req: Request<{ postId: string }, unknown, PostWithImageInput>, res: Response): Promise<void> {
    const { imageId, imgVersion } = req.body;
    if (imageId && imgVersion) {
      UpdatePostController.updatePostWithoutImage(req);
    } else {
      const result: UploadApiResponse = await UpdatePostController.addImageToExistingPost(req);
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      }
    }
    res.status(HTTP_STATUS.OK).json({ message: 'Post with image updated successfully' });
  }

  private static async updatePostWithoutImage(req: Request<{ postId: string }, unknown, PostWithImageInput>): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imageId, profilePicture } = req.body;
    const { postId } = req.params;
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId: imageId ? imageId : '',
      imgVersion: imgVersion ? imgVersion : ''
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated });
  }

  private static async addImageToExistingPost(req: Request): Promise<UploadApiResponse> {
    const { post, bgColor, feelings, privacy, gifUrl, profilePicture, image } = req.body;
    const { postId } = req.params;
    const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
    if (!result?.public_id) {
      return result;
    }
    const updatedPost = {
      post,
      bgColor,
      privacy,
      feelings,
      gifUrl,
      profilePicture,
      imgId: image ? result.public_id : '',
      imgVersion: image ? result.version.toString() : ''
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB', { key: postId, value: postUpdated });

    if (image) {
      imageQueue.addImageJob('addImageToDB', {
        key: `${req.currentUser!.userId}`,
        imgId: result.public_id,
        imgVersion: result.version.toString()
      });
    }
    return result;
  }
}
