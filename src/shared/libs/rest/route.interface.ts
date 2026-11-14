import {RequestHandler} from 'express';

export type HttpMethod = 'get' | 'post' | 'patch' | 'put' | 'delete';

export interface IRoute {
  path: string;
  method: HttpMethod;
  handler: RequestHandler;
}
