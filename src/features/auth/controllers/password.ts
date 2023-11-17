import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { config } from '@root/config';
import { BadRequestError } from '@globals/helpers/error-handler';
import { authService } from '@services/db/auth.service';
import { zodValidation } from '@globals/decorators/zod-validation.decorator';
import { EmailInput, PasswordInput, emailSchema, passwordSchema } from '@auth/schemes/password';
import { createHash } from 'crypto';
import { forgotPasswordTemplate } from '@services/emails/templates/forgot-password/forgot-password-template';
import { emailQueue } from '@services/queues/email.queue';
import { resetPasswordTemplate } from '@services/emails/templates/reset-password/reset-password-template';
import publicIP from 'ip';
import * as dateFns from 'date-fns';

export class PasswordController {
  @zodValidation(emailSchema)
  public static async forgotPassword(req: Request<unknown, unknown, EmailInput>, res: Response): Promise<void> {
    const { email } = req.body;
    const existingAuthUser = await authService.getAuthUserByEmail(email);
    if (!existingAuthUser) {
      throw new BadRequestError('Invalid email');
    }
    const resetToken = existingAuthUser.createPasswordResetToken();
    await existingAuthUser.save({ validateBeforeSave: false });
    const resetLink = `${config.CLIENT_URL}/reset-password/${resetToken}`;
    const template: string = forgotPasswordTemplate.passwordResetTemplate(existingAuthUser.username, resetLink);
    emailQueue.addEmailJob('passwordEmailNotification', { template, receiverEmail: email, subject: 'Reset your password' });
    res.status(HTTP_STATUS.OK).json({ message: 'Password reset email sent' });
  }

  @zodValidation(passwordSchema)
  public static async resetPassword(req: Request<{ token: string }, unknown, PasswordInput>, res: Response): Promise<void> {
    const { password } = req.body;
    const hashedToken = createHash('sha256').update(req.params.token).digest('hex');
    const existingAuthUser = await authService.getAuthUserByToken(hashedToken);
    if (!existingAuthUser) {
      throw new BadRequestError('Token is invalid or has expired');
    }
    existingAuthUser.password = password;
    existingAuthUser.passwordResetToken = undefined;
    existingAuthUser.passwordResetExpires = undefined;
    await existingAuthUser.save();

    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate({
      username: existingAuthUser.username,
      email: existingAuthUser.email,
      date: dateFns.format(new Date(), 'dd/mm/yyyy hh:mm'),
      ipaddress: publicIP.address()
    });

    emailQueue.addEmailJob('passwordEmailNotification', {
      template,
      receiverEmail: existingAuthUser.email,
      subject: 'Password Reset Confirmation'
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated!' });
  }
}
