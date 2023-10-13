import HTTP_STATUS from 'http-status-codes';
import { ZodIssue } from 'zod';

export interface IErrorResponse {
  status: string;
  statusCode: number;
  message: string;
  serializeErrors: IError;
}

export interface IError {
  message: string;
  status: string;
  statusCode: number;
}

export abstract class CustomError extends Error {
  abstract status: string;
  abstract statusCode: number;

  constructor(message: string) {
    super(message);
  }

  abstract serializeErrors(): IError[];
}

export class BadRequestError extends CustomError {
  statusCode = HTTP_STATUS.BAD_REQUEST;
  status = 'error';
  constructor(public message: string) {
    super(message);
  }

  public serializeErrors() {
    return [
      {
        statusCode: this.statusCode,
        message: this.message,
        status: this.status
      }
    ];
  }
}

export class NotFoundError extends CustomError {
  statusCode = HTTP_STATUS.NOT_FOUND;
  status = 'error';
  constructor(public message: string) {
    super(message);
  }

  public serializeErrors() {
    return [
      {
        statusCode: this.statusCode,
        message: this.message,
        status: this.status
      }
    ];
  }
}

export class UnAuthorizedError extends CustomError {
  statusCode = HTTP_STATUS.UNAUTHORIZED;
  status = 'error';
  constructor(public message: string) {
    super(message);
  }

  public serializeErrors() {
    return [
      {
        statusCode: this.statusCode,
        message: this.message,
        status: this.status
      }
    ];
  }
}

export class FileTooLarge extends CustomError {
  statusCode = HTTP_STATUS.REQUEST_TOO_LONG;
  status = 'error';
  constructor(public message: string) {
    super(message);
  }

  public serializeErrors() {
    return [
      {
        statusCode: this.statusCode,
        message: this.message,
        status: this.status
      }
    ];
  }
}

export class ServerError extends CustomError {
  statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;
  status = 'error';
  constructor(public message: string) {
    super(message);
  }

  public serializeErrors() {
    return [
      {
        statusCode: this.statusCode,
        message: this.message,
        status: this.status
      }
    ];
  }
}

export class RequestValidationError extends CustomError {
  statusCode: number = 400;
  status = 'error';
  constructor(private issues: ZodIssue[]) {
    super('Invalid request parameters');
  }

  public serializeErrors() {
    return this.issues.map((issue) => ({
      message: issue.message,
      statusCode: this.statusCode,
      status: this.status
    }));
  }
}
