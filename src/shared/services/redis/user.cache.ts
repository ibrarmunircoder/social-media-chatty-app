import Logger from 'bunyan';
import { config } from '@root/config';
import { BaseCache } from '@services/redis/base.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { ServerError } from '@globals/helpers/error-handler';
import { Helpers } from '@globals/helpers/helpers';

const log: Logger = config.createLogger('userCache');

export class UserCache extends BaseCache {
  constructor() {
    super('userCache');
  }

  public async saveUserToCache(key: string, userUId: string, createdUser: IUserDocument): Promise<void> {
    const createdAt = new Date();
    const {
      _id,
      uId,
      email,
      username,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social
    } = createdUser;
    const dataToSave = {
      _id: `${_id}`,
      uId: `${uId}`,
      username: `${username}`,
      email: `${email}`,
      avatarColor: `${avatarColor}`,
      createdAt: `${createdAt}`,
      postsCount: `${postsCount}`,
      blocked: JSON.stringify(blocked),
      blockedBy: JSON.stringify(blockedBy),
      profilePicture: `${profilePicture}`,
      followersCount: `${followersCount}`,
      followingCount: `${followingCount}`,
      notifications: JSON.stringify(notifications),
      social: JSON.stringify(social),
      work: `${work}`,
      location: `${location}`,
      school: `${school}`,
      quote: `${quote}`,
      bgImageVersion: `${bgImageVersion}`,
      bgImageId: `${bgImageId}`
    };
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.ZADD('user', { score: parseInt(userUId, 10), value: `${key}` });
      for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
        await this.client.HSET(`users:${key}`, `${itemKey}`, `${itemValue}`);
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getUserFromCache(key: string): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const user: IUserDocument = (await this.client.HGETALL(`users:${key}`)) as unknown as IUserDocument;
      user.createdAt = new Date(Helpers.parseJson(`${user.createdAt}`));
      user.postsCount = Helpers.parseJson(`${user.postsCount}`);
      user.blocked = Helpers.parseJson(`${user.blocked}`);
      user.blockedBy = Helpers.parseJson(`${user.blockedBy}`);
      user.notifications = Helpers.parseJson(`${user.notifications}`);
      user.social = Helpers.parseJson(`${user.social}`);
      user.followersCount = Helpers.parseJson(`${user.followersCount}`);
      user.followingCount = Helpers.parseJson(`${user.followingCount}`);
      user.bgImageId = Helpers.parseJson(`${user.bgImageId}`);
      user.bgImageVersion = Helpers.parseJson(`${user.bgImageVersion}`);
      user.profilePicture = Helpers.parseJson(`${user.profilePicture}`);
      user.work = Helpers.parseJson(`${user.work}`);
      user.school = Helpers.parseJson(`${user.school}`);
      user.location = Helpers.parseJson(`${user.location}`);
      user.quote = Helpers.parseJson(`${user.quote}`);
      return user;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
