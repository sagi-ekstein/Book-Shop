import { Logger } from '@overnightjs/logger';

export class AppLogger {
  private static logger: Logger;

  private constructor() {}

  static getLogger(): Logger {
    if (!AppLogger.logger) {
      AppLogger.logger = new Logger();
    }
    return AppLogger.logger;
  }
}
