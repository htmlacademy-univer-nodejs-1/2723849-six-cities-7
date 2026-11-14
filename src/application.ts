import { inject, injectable } from 'inversify';
import type { ILogger } from './shared/logger/logger.interface.js';
import { TYPES } from './shared/types/di.type.js';
import {AppConfig} from './shared/config/config.js';
import {IDatabaseClient} from './shared/database-client/database-client.interface';

@injectable()
export class Application {
  constructor(
    @inject(TYPES.Logger) private readonly logger: ILogger,
    @inject(TYPES.Config) private readonly config: AppConfig,
    @inject(TYPES.DatabaseClient) private readonly databaseClient: IDatabaseClient,) {}

  public async init(uri?: string): Promise<void> {
    this.config.validate({ allowed: 'strict' });
    await this.databaseClient.connect(uri);
    this.logger.info('Application initialized');
    this.logger.info('Application port', { port: this.config.get('port') });
  }

  public async close(): Promise<void> {
    await this.databaseClient.disconnect();
  }
}
