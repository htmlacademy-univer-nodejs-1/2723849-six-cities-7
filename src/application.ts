import { inject, injectable } from 'inversify';
import type { ILogger } from './shared/logger/logger.interface.js';
import { TYPES } from './shared/types/di.type.js';
import {AppConfig} from './shared/config/config.js';
import {IDatabaseClient} from './shared/database-client/database-client.interface.js';
import express from 'express';
import {UserController} from './shared/modules/user/user.controller.js';

@injectable()
export class Application {
  private readonly expressApp = express();

  constructor(
    @inject(TYPES.Logger) private readonly logger: ILogger,
    @inject(TYPES.Config) private readonly config: AppConfig,
    @inject(TYPES.DatabaseClient) private readonly databaseClient: IDatabaseClient,
    @inject(TYPES.UserController) private readonly userController: UserController) {}

  public async init(uri?: string): Promise<void> {
    this.config.validate({ allowed: 'strict' });
    await this.databaseClient.connect(uri);
    this.initMiddleware();
    this.initControllers();
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

  private initControllers(): void {
    this.expressApp.use('/users', this.userController.router);
  }

  public async close(): Promise<void> {
    await this.databaseClient.disconnect();
  }
}
