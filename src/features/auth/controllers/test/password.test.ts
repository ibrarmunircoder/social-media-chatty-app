import { Request, Response } from 'express';
import { PasswordController } from '@auth/controllers/password';
import { authMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { CustomError } from '@globals/helpers/error-handler';
import { emailQueue } from '@services/queues/email.queue';
import { authService } from '@services/db/auth.service';
import { PasswordInput } from '@auth/schemes/password';

const WRONG_EMAIL = 'test@email.com';
const CORRECT_EMAIL = 'manny@me.com';
const INVALID_EMAIL = 'test';
const CORRECT_PASSWORD = 'manny';

jest.mock('@services/queues/base.queue');
jest.mock('@services/queues/email.queue');
jest.mock('@services/db/auth.service');
jest.mock('@services/emails/mail.transport');

describe('Password', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw an error if email is invalid', () => {
      const req: Request = authMockRequest({}, { email: INVALID_EMAIL }) as Request;
      const res: Response = authMockResponse();
      PasswordController.forgotPassword(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors()[0].message).toEqual('Email must be valid');
      });
    });

    it('should throw "Invalid credentials" if email does not exist', () => {
      const req: Request = authMockRequest({}, { email: WRONG_EMAIL }) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValue(null as any);
      PasswordController.forgotPassword(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors()[0].message).toEqual('Invalid email');
      });
    });

    it('should send correct json response', async () => {
      const req: Request = authMockRequest({}, { email: CORRECT_EMAIL }) as Request;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValue(authMock);
      jest.spyOn(emailQueue, 'addEmailJob');
      await PasswordController.forgotPassword(req, res);
      expect(emailQueue.addEmailJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password reset email sent'
      });
    });
  });

  describe('update', () => {
    it('should throw an error if password is empty', () => {
      const req = authMockRequest({}, { password: '' }) as Request<{ token: string }, unknown, PasswordInput>;
      const res: Response = authMockResponse();
      PasswordController.resetPassword(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors()[0].message).toEqual('Password is too short - should be min 6 chars');
      });
    });

    it('should throw an error if password and confirmPassword are different', () => {
      const req = authMockRequest({}, { password: CORRECT_PASSWORD, confirmPassword: `${CORRECT_PASSWORD}2` }) as Request<
        { token: string },
        unknown,
        PasswordInput
      >;
      const res: Response = authMockResponse();
      PasswordController.resetPassword(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors()[0].message).toEqual('Passwords should be matched');
      });
    });

    it('should throw error if reset token has expired', () => {
      const req = authMockRequest({}, { password: CORRECT_PASSWORD, confirmPassword: CORRECT_PASSWORD }, null, {
        token: '123214'
      }) as Request<{ token: string }, unknown, PasswordInput>;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'getAuthUserByToken').mockResolvedValue(null as any);
      PasswordController.resetPassword(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors()[0].message).toEqual('Token is invalid or has expired');
      });
    });

    it('should send correct json response', async () => {
      const req = authMockRequest({}, { password: CORRECT_PASSWORD, confirmPassword: CORRECT_PASSWORD }, null, {
        token: '12sde3'
      }) as Request<{ token: string }, unknown, PasswordInput>;
      const res: Response = authMockResponse();
      jest.spyOn(authService, 'getAuthUserByToken').mockResolvedValue(authMock);
      jest.spyOn(emailQueue, 'addEmailJob');
      await PasswordController.resetPassword(req, res);
      expect(emailQueue.addEmailJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password successfully updated!'
      });
    });
  });
});
