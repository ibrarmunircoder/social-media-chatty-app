import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UserCache } from '@services/redis/user.cache';
import { userQueue } from '@services/queues/user.queue';
import { notificationSettingsSchema } from '@user/schemes/info';
import { zodValidation } from '@globals/decorators/zod-validation.decorator';

const userCache: UserCache = new UserCache();

export class UpdateSettingsController {
  @zodValidation(notificationSettingsSchema)
  public static async notification(req: Request, res: Response): Promise<void> {
    await userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, 'notifications', req.body);
    userQueue.addUserJob('updateNotificationSettings', {
      key: `${req.currentUser!.userId}`,
      value: req.body
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Notification settings updated successfully', settings: req.body });
  }
}
