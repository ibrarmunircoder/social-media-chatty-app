import JWT from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from '@root/config';
import { IAuthPayload } from '@auth/interfaces/auth.interface';
import { UnAuthorizedError } from '@globals/helpers/error-handler';

export class AuthMiddleware {
  public verifyUser(req: Request, res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      return next();
    }

    try {
      const payload = JWT.verify(req.session.jwt, config.JWT_TOKEN!) as IAuthPayload;
      req.currentUser = payload;
    } catch (err) {
      /* empty */
    }
    next();
  }

  public requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.currentUser) {
      throw new UnAuthorizedError('Not Authorized');
    }
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
