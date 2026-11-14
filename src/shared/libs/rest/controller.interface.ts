import type {ParamsDictionary} from 'express-serve-static-core';
import {Router} from 'express';
import {IRoute} from './route.interface.js';

export interface IController {
  readonly router: Router;
  addRoute<P extends ParamsDictionary>(route: IRoute<P>): void;
}
