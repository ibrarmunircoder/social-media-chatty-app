import { IAuthJob } from '@auth/interfaces/auth.interface';
import { BaseQueue } from '@services/queues/base.queue';
import { userWorker } from '@workers/user.worker';

class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.processJob('addUserToDb', 5, userWorker.addUserToDb);
  }

  public addUserJob(name: string, data: IAuthJob) {
    this.addJob(name, data);
  }
}

export const userQueue: UserQueue = new UserQueue();
