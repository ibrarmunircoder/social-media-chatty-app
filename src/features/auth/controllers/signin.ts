import { Request, Response } from 'express';
import { zodValidation } from '@globals/decorators/zod-validation.decorator';
import HTTP_STATUS from 'http-status-codes';
import { config } from '@root/config';
import { authService } from '@services/db/auth.service';
import { LoginInput, loginSchema } from '@auth/schemes/signin';
import { BadRequestError } from '@globals/helpers/error-handler';
import JWT from 'jsonwebtoken';
import { userService } from '@services/db/user.service';
import { IUserDocument } from '@user/interfaces/user.interface';

export class SignInController {
  @zodValidation(loginSchema)
  public static async signIn(req: Request<unknown, unknown, LoginInput>, res: Response): Promise<void> {
    const { username, password } = req.body;
    const existingAuthUser = await authService.getAuthUserByUsername(username);
    if (!existingAuthUser) {
      throw new BadRequestError('Invalid username or password');
    }
    const passwordMatch: boolean = await existingAuthUser.comparePassword(password);
    if (!passwordMatch) {
      throw new BadRequestError('Invalid username and password');
    }

    const user: IUserDocument = await userService.getUserByAuthId(`${existingAuthUser._id}`);

    const token: string = JWT.sign(
      {
        userId: user._id,
        uId: existingAuthUser.uId,
        email: existingAuthUser.email,
        username: existingAuthUser.username,
        avatarColor: existingAuthUser.avatarColor
      },
      config.JWT_TOKEN!
    );

    const userDocument = {
      ...user,
      authId: existingAuthUser!._id,
      username: existingAuthUser!.username,
      email: existingAuthUser!.email,
      avatarColor: existingAuthUser!.avatarColor,
      uId: existingAuthUser!.uId,
      createdAt: existingAuthUser!.createdAt
    };

    req.session = { jwt: token };

    res.status(HTTP_STATUS.OK).json({ message: 'User login successfully', user: userDocument, token });
  }
}
