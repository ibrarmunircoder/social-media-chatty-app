import express, { Router } from 'express';
import { authMiddleware } from '@globals/middlewares/auth.middleware';
import { GetUserProfileController } from '@user/controllers/get-profile';
import { SearchUserController } from '@user/controllers/search-user';
import { ChangePasswordController } from '@user/controllers/change-password';
import { UpdateBasicInfoController } from '@user/controllers/update-basic-info';
import { UpdateSettingsController } from '@user/controllers/update-settings';
// import { Search } from '@user/controllers/search-user';
// import { Update } from '@user/controllers/change-password';
// import { Edit } from '@user/controllers/update-basic-info';
// import { UpdateSettings } from '@user/controllers/update-settings';

class UserRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.use(authMiddleware.verifyUser);
    this.router.get('/user/all/:page', authMiddleware.requireAuth, GetUserProfileController.all);
    this.router.get('/user/profile', authMiddleware.requireAuth, GetUserProfileController.profile);
    this.router.get('/user/profile/:userId', authMiddleware.requireAuth, GetUserProfileController.profileByUserId);
    this.router.get('/user/profile/posts/:username/:userId/:uId', authMiddleware.requireAuth, GetUserProfileController.profileAndPosts);
    this.router.get('/user/profile/user/suggestions', authMiddleware.requireAuth, GetUserProfileController.randomUserSuggestions);
    this.router.get('/user/profile/search/:query', authMiddleware.requireAuth, SearchUserController.user);
    this.router.put('/user/profile/change-password', authMiddleware.requireAuth, ChangePasswordController.password);
    this.router.put('/user/profile/basic-info', authMiddleware.requireAuth, UpdateBasicInfoController.info);
    this.router.put('/user/profile/social-links', authMiddleware.requireAuth, UpdateBasicInfoController.social);
    this.router.put('/user/profile/settings', authMiddleware.requireAuth, UpdateSettingsController.notification);
    return this.router;
  }
}

export const userRoutes: UserRoutes = new UserRoutes();
