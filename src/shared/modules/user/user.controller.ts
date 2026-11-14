import {inject, injectable} from 'inversify';
import type {Request, Response} from 'express';
import {Controller} from '../../libs/rest/controller.abstract.js';
import {currentUser, requireUser} from '../../libs/rest/auth.js';
import {HttpError} from '../../libs/rest/http-error.js';
import {TYPES} from '../../types/di.type.js';
import type {IUserService} from './user-service.interface.js';
import type {CreateUserDto} from './dto/create-user.dto.js';
import type {LoginUserDto} from './dto/login-user.dto.js';
import {AuthService} from '../auth/auth.service.js';
import {toUserRdo} from './rdo/user.rdo.js';

@injectable()
export class UserController extends Controller {
  constructor(
    @inject(TYPES.UserService) private readonly userService: IUserService,
    @inject(TYPES.AuthService) private readonly authService: AuthService
  ) {
    super();
    this.addRoute({path: '/', method: 'post', handler: this.create});
    this.addRoute({path: '/login', method: 'post', handler: this.login});
    this.addRoute({path: '/login', method: 'get', handler: this.check});
    this.addRoute({path: '/login', method: 'delete', handler: this.logout});
  }

  private async create(req: Request<object, unknown, CreateUserDto>, res: Response): Promise<void> {
    this.requireAnonymous(res);
    if (await this.userService.findByEmail(req.body.email)) {
      throw new HttpError(409, 'Пользователь с таким email уже существует');
    }
    const {name, email, password, userType, avatar} = req.body;
    const user = await this.userService.create({name, email, password, userType, avatar});
    this.created(res, toUserRdo(user));
  }

  private async login(req: Request<object, unknown, LoginUserDto>, res: Response): Promise<void> {
    this.requireAnonymous(res);
    const user = await this.userService.verifyPassword(req.body.email, req.body.password);
    if (!user) {
      throw new HttpError(401, 'Неверный email или пароль');
    }
    this.ok(res, {token: await this.authService.createToken(user)});
  }

  private async check(_req: Request, res: Response): Promise<void> {
    this.ok(res, toUserRdo(requireUser(res)));
  }

  private async logout(_req: Request, res: Response): Promise<void> {
    requireUser(res);
    await this.authService.revoke(res.locals.token);
    this.noContent(res);
  }

  private requireAnonymous(res: Response): void {
    if (currentUser(res)) {
      throw new HttpError(403, 'Доступно только неавторизованным пользователям');
    }
  }
}
