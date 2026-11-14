import type {ParamsDictionary} from 'express-serve-static-core';
import type {IController} from './controller.interface.js';
import {Response, Router} from 'express';
import type {IRoute} from './route.interface.js';
import {StatusCodes} from 'http-status-codes';
import {injectable} from 'inversify';

@injectable()
export abstract class Controller implements IController {
  public readonly router = Router();

  public addRoute<P extends ParamsDictionary>(route: IRoute<P>): void {
    const handler = route.handler.bind(this);
    this.router[route.method]<P>(route.path, handler);
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
