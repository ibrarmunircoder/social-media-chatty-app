import express, { Router } from 'express';
import { authMiddleware } from '@globals/middlewares/auth.middleware';
import { AddImageController } from '@images/controllers/add-image';
import { DeleteImageController } from '@images/controllers/delete-image';
import { GetImagesController } from '@images/controllers/get-images';

class ImageRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.use(authMiddleware.verifyUser);
    this.router.get('/images/:userId', authMiddleware.requireAuth, GetImagesController.images);
    this.router.post('/images/profile', authMiddleware.requireAuth, AddImageController.profileImage);
    this.router.post('/images/background', authMiddleware.requireAuth, AddImageController.backgroundImage);
    this.router.delete('/images/:imageId', authMiddleware.requireAuth, DeleteImageController.image);
    this.router.delete('/images/background/:bgImageId', authMiddleware.requireAuth, DeleteImageController.backgroundImage);

    return this.router;
  }
}

export const imageRoutes: ImageRoutes = new ImageRoutes();
