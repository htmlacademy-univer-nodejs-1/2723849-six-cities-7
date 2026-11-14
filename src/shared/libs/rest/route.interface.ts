import type {RequestHandler} from 'express';
import type {ParamsDictionary} from 'express-serve-static-core';

export type HttpMethod = 'get' | 'post' | 'patch' | 'put' | 'delete';

export interface IRoute<P extends ParamsDictionary = ParamsDictionary> {
  path: string;
  method: HttpMethod;
  handler: RequestHandler<P>;
}
