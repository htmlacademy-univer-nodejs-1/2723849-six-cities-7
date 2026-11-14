import {Router} from 'express';
import {IRoute} from "./route.interface";

export interface IController {
  readonly router: Router;
  addRoute(route: IRoute): void;
}
