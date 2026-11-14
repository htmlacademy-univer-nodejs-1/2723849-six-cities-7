import {IController} from './controller.interface';
import {Response, Router} from 'express';
import {IRoute} from './route.interface';
import {StatusCodes} from 'http-status-codes';
import {injectable} from 'inversify';

@injectable()
export abstract class Controller implements IController {
  public readonly router = Router();

  public addRoute(route: IRoute): void {
    const handler = route.handler.bind(this);
    this.router[route.method](route.path, handler);
  }

  protected send<T>(res: Response, statusCode: number, data: T): void {
    res.status(statusCode).json(data);
  }

  protected ok<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.OK, data);
  }

  protected created<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.CREATED, data);
  }

  protected noContent(res: Response): void {
    res.status(StatusCodes.NO_CONTENT).end();
  }

}
