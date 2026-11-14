import {inject, injectable} from 'inversify';
import express from 'express';
import type {Server} from 'node:http';
import type {ILogger} from './shared/logger/logger.interface.js';
import {TYPES} from './shared/types/di.type.js';
import type {AppConfig} from './shared/config/config.js';
import type {IDatabaseClient} from './shared/database-client/database-client.interface.js';
import {UserController} from './shared/modules/user/user.controller.js';
import {OfferController} from './shared/modules/offer/offer.controller.js';
import {CityController} from './shared/modules/city/city.controller.js';
import {FavouriteController} from './shared/modules/favourites/favourite.controller.js';
import {AuthService} from './shared/modules/auth/auth.service.js';
import {HttpError} from './shared/libs/rest/http-error.js';
import {errorHandler} from './shared/libs/rest/error-handler.js';

@injectable()
export class Application {
  private readonly expressApp = express();
  private server?: Server;

  constructor(
    @inject(TYPES.Logger) private readonly logger: ILogger,
    @inject(TYPES.Config) private readonly config: AppConfig,
    @inject(TYPES.DatabaseClient) private readonly databaseClient: IDatabaseClient,
    @inject(TYPES.UserController) private readonly userController: UserController,
    @inject(TYPES.OfferController) private readonly offerController: OfferController,
    @inject(TYPES.CityController) private readonly cityController: CityController,
    @inject(TYPES.FavouriteController) private readonly favouriteController: FavouriteController,
    @inject(TYPES.AuthService) private readonly authService: AuthService
  ) {}

  public async init(uri?: string): Promise<void> {
    this.config.validate({allowed: 'strict'});
    await this.databaseClient.connect(uri);
    this.initMiddleware();
    this.initControllers();
    this.expressApp.use((_req, res) => {
      res.status(404).json({message: 'Маршрут не найден'});
    });
    this.expressApp.use(errorHandler);
    const port = this.config.get('port');
    try {
      await new Promise<void>((resolve, reject) => {
        this.server = this.expressApp.listen(port, () => {
          this.logger.info('Application initialized', {port});
          resolve();
        });
        this.server.once('error', reject);
      });
    } catch (error) {
      await this.databaseClient.disconnect();
      throw error;
    }
  }

  public initMiddleware(): void {
    this.expressApp.use(express.json());
    this.expressApp.use(async (req, res, next) => {
      const header = req.get('Authorization');
      if (header !== undefined) {
        const match = /^Bearer ([^\s]+)$/i.exec(header);
        if (!match) {
          throw new HttpError(401, 'Invalid token');
        }
        const user = await this.authService.authenticate(match[1]);
        if (!user) {
          throw new HttpError(401, 'Недействительный токен');
        }
        res.locals.user = user;
        res.locals.token = match[1];
      }
      next();
    });
  }

  private initControllers(): void {
    this.expressApp.use('/users', this.userController.router);
    this.expressApp.use('/offers', this.offerController.router);
    this.expressApp.use('/cities', this.cityController.router);
    this.expressApp.use('/favorites', this.favouriteController.router);
  }

  public async close(): Promise<void> {
    const server = this.server;
    if (server?.listening) {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
      });
    }
    await this.databaseClient.disconnect();
  }
}
