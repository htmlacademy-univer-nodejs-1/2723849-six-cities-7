import type {Request, Response, NextFunction} from 'express';

export interface IExceptionFilter {
  catch(
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ): void;
}
