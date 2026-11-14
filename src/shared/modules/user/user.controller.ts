import {inject, injectable} from 'inversify';
import type {Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';
import {Controller} from '../../libs/rest/controller.abstract.js';
import {TYPES} from '../../types/di.type.js';
import type {IUserService} from './user-service.interface.js';
import type {CreateUserDto} from './dto/create-user.dto.js';
import {toUserRdo} from './rdo/user.rdo.js';

@injectable()
export class UserController extends Controller {
  constructor(
    @inject(TYPES.UserService)
    private readonly userService: IUserService
  ) {
    super();

    this.addRoute({
      path: '/',
      method: 'post',
      handler: this.create
    });
  }

  private async create(
    req: Request<object, unknown, CreateUserDto>,
    res: Response
  ): Promise<void> {
    const existingUser = await this.userService.findByEmail(req.body.email);

    if (existingUser) {
      this.send(res, StatusCodes.CONFLICT, {
        message: 'Пользователь с таким email уже существует'
      });
      return;
    }

    const user = await this.userService.create(req.body);

    this.created(res, toUserRdo(user));
  }
}
