import { StatusCodes } from 'http-status-codes';
import { CustomError } from './customError';

export class NotFoundError extends CustomError {
  statusCode = StatusCodes.NOT_FOUND;

  constructor() {
    super('Route not found');

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ message: 'Not Found' }];
  }
}
