import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import moment from 'moment';
import publicIP from 'ip';
import { userService } from '@services/db/user.service';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import { changePasswordSchema } from '@user/schemes/info';
import { BadRequestError } from '@globals/helpers/error-handler';
import { authService } from '@services/db/auth.service';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { resetPasswordTemplate } from '@services/emails/templates/reset-password/reset-password-template';
import { emailQueue } from '@services/queues/email.queue';
import { zodValidation } from '@globals/decorators/zod-validation.decorator';

export class ChangePasswordController {
  @zodValidation(changePasswordSchema)
  public static async password(req: Request, res: Response): Promise<void> {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      throw new BadRequestError('Passwords do not match.');
    }
    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(req.currentUser!.username);
    const passwordsMatch: boolean = await existingUser.comparePassword(currentPassword);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }
    const hashedPassword: string = await existingUser.hashPassword(newPassword);
    userService.updatePassword(`${req.currentUser!.username}`, hashedPassword);

    const templateParams: IResetPasswordParams = {
      username: existingUser.username!,
      email: existingUser.email!,
      ipaddress: publicIP.address(),
      date: moment().format('DD//MM//YYYY HH:mm')
    };
    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('changePassword', { template, receiverEmail: existingUser.email!, subject: 'Password update confirmation' });
    res.status(HTTP_STATUS.OK).json({
      message: 'Password updated successfully. You will be redirected shortly to the login page.'
    });
  }
}
