import { Request, Response } from 'express';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@services/db/user.service';
import HTTP_STATUS from 'http-status-codes';

const userCache: UserCache = new UserCache();

export class CurrentUserController {
  public static async getCurrentLoggedInUser(req: Request, res: Response): Promise<void> {
    let isUser = false;
    let token = null;
    let user = null;
    const cachedUser = await userCache.getUserFromCache(`${req.currentUser?.userId}`);
    const existingUser: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(`${req.currentUser!.userId}`);
    if (Object.keys(existingUser).length) {
      isUser = true;
      token = req.session?.jwt;
      user = existingUser;
    }
    res.status(HTTP_STATUS.OK).json({ token, isUser, user });
  }
}
