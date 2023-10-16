import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.model';
import { Helpers } from '@globals/helpers/helpers';

class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }

  public async getAuthUserByUsername(username: string): Promise<IAuthDocument | null> {
    const query = { username: Helpers.firstLetterUppercase(username) };
    const authUser = await AuthModel.findOne(query);
    return authUser;
  }

  public async getAuthUserByEmailOrUsername(username: string, email: string): Promise<IAuthDocument | null> {
    const query = {
      $or: [{ username: Helpers.firstLetterUppercase(username) }, { email }]
    };
    const authUser = await AuthModel.findOne(query);
    return authUser;
  }
}

export const authService = new AuthService();
