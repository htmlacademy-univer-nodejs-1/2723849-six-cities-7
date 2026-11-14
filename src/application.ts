import { inject, injectable } from 'inversify';
import type { ILogger } from './shared/logger/logger.interface.js';
import { TYPES } from './shared/types/di.type.js';
import {AppConfig} from './shared/config/config.js';

@injectable()
export class Application {
  constructor(
    @inject(TYPES.Logger) private readonly logger: ILogger,
   @inject(TYPES.Config) private readonly config: AppConfig) {}

  public init(): void {
    this.config.validate({ allowed: 'strict' });
    this.logger.info('Application initialized');
    this.logger.info('Application port', { port: this.config.get('port') });
  }
}
