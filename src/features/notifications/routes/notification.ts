import { authMiddleware } from '@globals/middlewares/auth.middleware';
import { DeleteNotificationController } from '@notifications/controllers/delete-notification';
import { GetNotificationsController } from '@notifications/controllers/get-notifications';
import { UpdateNotificationController } from '@notifications/controllers/update-notification';
import express, { Router } from 'express';

class NotificationRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.use(authMiddleware.verifyUser);
    this.router.route('/notification/:notificationId').put(authMiddleware.requireAuth, UpdateNotificationController.updateNotification);
    this.router.route('/notification/:notificationId').delete(authMiddleware.requireAuth, DeleteNotificationController.deleteNotification);
    this.router.route('/notifications').get(authMiddleware.requireAuth, GetNotificationsController.getNotifications);
    return this.router;
  }
}

export const notificationRoutes = new NotificationRoutes();
