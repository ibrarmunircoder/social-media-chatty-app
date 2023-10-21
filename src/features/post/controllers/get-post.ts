import { IPostDocument } from '@post/interfaces/post.interface';
import { postService } from '@services/db/post.service';
import { PostCache } from '@services/redis/post.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

const postCache: PostCache = new PostCache();
const PAGE_SIZE = 10;

export class GetPostController {
  public static async getPosts(req: Request<{ page: string }, unknown, unknown>, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
    const newSkip: number = skip === 0 ? skip : skip + 1;
    let posts: IPostDocument[] = [];
    let totalPosts: number = 0;
    const cachedPosts: IPostDocument[] = await postCache.getPostsFromCache('post', newSkip, limit);
    if (cachedPosts.length) {
      posts = cachedPosts;
      totalPosts = await postCache.getTotalPostsInCache();
    } else {
      posts = await postService.getPosts({}, skip, limit, { createdAt: -1 });
      totalPosts = await postCache.getTotalPostsInCache();
    }
    res.status(HTTP_STATUS.OK).json({ message: 'All Posts', posts, totalPosts });
  }

  public static async getPostsWithImages(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
    const newSkip: number = skip === 0 ? skip : skip + 1;
    let posts: IPostDocument[] = [];
    const cachedPosts: IPostDocument[] = await postCache.getPostsWithImagesFromCache('post', newSkip, limit);
    posts = cachedPosts.length ? cachedPosts : await postService.getPosts({ imgId: '$ne', gifUrl: '$ne' }, skip, limit, { createdAt: -1 });
    res.status(HTTP_STATUS.OK).json({ message: 'All posts with images', posts });
  }
}
