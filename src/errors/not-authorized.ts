import { StatusCodes } from "http-status-codes";
import { CustomError } from "./customError";

export class NotAuthorizedError extends CustomError {
  statusCode = StatusCodes.UNAUTHORIZED;

  constructor() {
    super("Not Authorized");

    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  serializeErrors() {
    return [{ message: "Not authorized" }];
  }
}
