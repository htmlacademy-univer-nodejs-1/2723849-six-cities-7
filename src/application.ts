import { inject, injectable } from 'inversify';
import type { ILogger } from './shared/logger/logger.interface.js';
import { TYPES } from './shared/types/di.type.js';
import {AppConfig} from './shared/config/config.js';
import {IDatabaseClient} from './shared/database-client/database-client.interface';
import express from 'express';

@injectable()
export class Application {
  private readonly expressApp = express();

  constructor(
    @inject(TYPES.Logger) private readonly logger: ILogger,
    @inject(TYPES.Config) private readonly config: AppConfig,
    @inject(TYPES.DatabaseClient) private readonly databaseClient: IDatabaseClient,) {}

  public async init(uri?: string): Promise<void> {
    this.config.validate({ allowed: 'strict' });
    await this.databaseClient.connect(uri);
    this.initMiddleware();
    const port = this.config.get('port');
    await new Promise<void>((resolve, reject) => {
      const server = this.expressApp.listen(port, () => {
        this.logger.info('Application initialized', {port});
        this.logger.info('Application port', { port: port });
        resolve();
      });
      server.once('error', reject);
    });
  }

  public initMiddleware(): void {
    this.expressApp.use(express.json());
  }

  public async close(): Promise<void> {
    await this.databaseClient.disconnect();
  }
}
