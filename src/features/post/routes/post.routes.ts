import { authMiddleware } from '@globals/middlewares/auth.middleware';
import { CreatePostController } from '@post/controllers/create-post';
import { DeletePostController } from '@post/controllers/delete-post';
import { GetPostController } from '@post/controllers/get-post';
import { UpdatePostController } from '@post/controllers/update-post';
import express, { Router } from 'express';

class PostRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.use(authMiddleware.verifyUser);
    this.router.post('/post', authMiddleware.requireAuth, CreatePostController.createPost);
    this.router.get('/posts/all/:page', authMiddleware.requireAuth, GetPostController.getPosts);
    this.router.get('/posts/images/:page', authMiddleware.requireAuth, GetPostController.getPostsWithImages);
    this.router.post('/post/image', authMiddleware.requireAuth, CreatePostController.createPostWithImage);
    this.router.put('/post/image/:postId', authMiddleware.requireAuth, UpdatePostController.updatePostWithImage);
    this.router
      .route('/post/:postId')
      .delete(authMiddleware.requireAuth, DeletePostController.deletePost)
      .put(authMiddleware.requireAuth, UpdatePostController.updatePost);
    return this.router;
  }
}

export const postRoutes: PostRoutes = new PostRoutes();
