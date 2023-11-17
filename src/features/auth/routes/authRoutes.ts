import { CurrentUserController } from '@auth/controllers/current-user';
import { PasswordController } from '@auth/controllers/password';
import { SignInController } from '@auth/controllers/signin';
import { SignOutController } from '@auth/controllers/signout';
import { SignUpController } from '@auth/controllers/signup';
import { authMiddleware } from '@globals/middlewares/auth.middleware';
import express, { Router } from 'express';

class AuthRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.route('/signup').post(SignUpController.signUp);
    this.router.route('/signin').post(SignInController.signIn);
    this.router.route('/forgot-password').post(PasswordController.forgotPassword);
    this.router.route('/reset-password/:token').post(PasswordController.resetPassword);

    this.router.use(authMiddleware.verifyUser);
    this.router.get('/signout', SignOutController.signOut);
    this.router.get('/currentuser', authMiddleware.requireAuth, CurrentUserController.getCurrentLoggedInUser);
    return this.router;
  }
}

export const authRoutes = new AuthRoutes();
