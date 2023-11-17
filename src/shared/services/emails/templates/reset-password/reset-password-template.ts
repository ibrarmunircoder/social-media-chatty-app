import fs from 'fs';
import ejs from 'ejs';
import path from 'path';
import { IResetPasswordParams } from '@user/interfaces/user.interface';

class ResetPasswordTemplate {
  public passwordResetConfirmationTemplate(templateParams: IResetPasswordParams): string {
    const { date, email, ipaddress, username } = templateParams;
    return ejs.render(fs.readFileSync(path.join(__dirname, 'reset-password-template.ejs'), 'utf-8'), {
      username,
      email,
      ipaddress,
      date,
      image_url: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    });
  }
}

export const resetPasswordTemplate: ResetPasswordTemplate = new ResetPasswordTemplate();
