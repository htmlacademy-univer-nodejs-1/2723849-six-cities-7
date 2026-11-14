import {ILogger} from './logger.interface.js';
import pino from 'pino';
import { injectable } from 'inversify';


@injectable()
export class PinoLogger implements ILogger {
  private readonly logger = pino({ level: 'info' });

  error(message: string, error: unknown): void {
    this.logger.error({err: error}, message);
  }

  info(message: string, data?: object): void {
    this.logger.info(data, message);
  }

  warn(message: string, data?: object): void {
    this.logger.warn(data, message);
  }

}
