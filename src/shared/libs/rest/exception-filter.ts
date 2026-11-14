import {inject, injectable} from 'inversify';
import type {Request, Response, NextFunction} from 'express';
import type {IExceptionFilter} from './exception-filter.interface.js';
import type {ILogger} from '../../logger/logger.interface.js';
import {TYPES} from '../../types/di.type.js';
import {HttpError} from './http-error.js';

@injectable()
export class ExceptionFilter implements IExceptionFilter {
  constructor(
    @inject(TYPES.Logger)
    private readonly logger: ILogger
  ) {}

  public catch(
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const httpError = this.toHttpError(error);

    if (httpError) {
      this.logger.warn(httpError.message, {
        method: req.method,
        path: req.path,
        statusCode: httpError.statusCode
      });
    } else {
      this.logger.error(`Unhandled exception: ${req.method} ${req.path}`, error);
    }

    if (res.headersSent) {
      next(error);
      return;
    }


    if (httpError) {
      res.status(httpError.statusCode).json({message: httpError.message});
      return;
    }

    res.status(500).json({
      message: 'Внутренняя ошибка сервера'
    });
  }

  private toHttpError(error: unknown): HttpError | null {
    if (error instanceof HttpError) {
      return error;
    }

    if (typeof error !== 'object' || error === null) {
      return null;
    }

    if ('code' in error && error.code === 11000) {
      return new HttpError(409, 'Запись уже существует');
    }

    if ('name' in error && error.name === 'CastError') {
      return new HttpError(400, 'Некорректный формат данных');
    }

    if ('type' in error && error.type === 'entity.parse.failed') {
      return new HttpError(400, 'Некорректный JSON');
    }

    return null;
  }
}
