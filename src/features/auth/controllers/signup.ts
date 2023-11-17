import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { zodValidation } from '@globals/decorators/zod-validation.decorator';
import { CreateUserInput, signupSchema } from '@auth/schemes/signup';
import { authService } from '@services/db/auth.service';
import { BadRequestError } from '@globals/helpers/error-handler';
import { uploads } from '@globals/helpers/cloudinary-uploads';
import HTTP_STATUS from 'http-status-codes';
import { Helpers } from '@globals/helpers/helpers';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserCache } from '@services/redis/user.cache';
import { omit } from 'lodash';
import { authQueue } from '@services/queues/auth.queue';
import { userQueue } from '@services/queues/user.queue';
import JWT from 'jsonwebtoken';
import { config } from '@root/config';

const userCache: UserCache = new UserCache();

export class SignUpController {
  @zodValidation(signupSchema)
  public static async signUp(req: Request<unknown, unknown, CreateUserInput>, res: Response): Promise<void> {
    const { avatarColor, avatarImage, email, password, username } = req.body;
    const checkUserExist = await authService.getAuthUserByEmailOrUsername(username, email);
    if (checkUserExist) {
      throw new BadRequestError(`User with ${email} or ${username} already exists`);
    }
    const authObjectId = new ObjectId();
    const userObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;
    const result = await uploads(avatarImage, `${userObjectId}`, true, true);
    if (!result?.public_id) {
      throw new BadRequestError('File upload: Error occurred. Try again!');
    }
    const signupDataPayload: IAuthDocument = {
      _id: authObjectId,
      uId,
      email,
      password,
      avatarColor,
      username: Helpers.firstLetterUppercase(username),
      createdAt: new Date()
    } as IAuthDocument;

    // Add user data to redis cache
    const userDataForCache: IUserDocument = SignUpController.userDocumentData(signupDataPayload, userObjectId);
    userDataForCache.profilePicture = `https://res.cloudinary.com/dqhlu0ws4/image/upload/v${result.version}/${userObjectId}`;
    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

    // Add to database
    const userDataCacheResult = omit(userDataForCache, ['uId', 'email', 'username', 'avatarColor', 'password']);

    authQueue.addAuthUserJob('addAuthUserToDb', { value: signupDataPayload });
    userQueue.addUserJob('addUserToDb', { value: userDataCacheResult });

    const token: string = SignUpController.signToken(signupDataPayload, userObjectId);
    req.session = { jwt: token };

    res.status(HTTP_STATUS.CREATED).json({ status: 'success', message: 'User created successfully', user: userDataForCache, token });
  }

  private static signToken(data: IAuthDocument, userObjectId: ObjectId): string {
    return JWT.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor
      },
      config.JWT_TOKEN!
    );
  }

  private static userDocumentData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username,
      email,
      password,
      avatarColor,
      profilePicture: '',
      blocked: [],
      blockedBy: [],
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageVersion: '',
      bgImageId: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }
    } as unknown as IUserDocument;
  }
}
