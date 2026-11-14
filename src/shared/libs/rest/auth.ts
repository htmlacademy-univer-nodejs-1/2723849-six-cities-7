import type {Response} from 'express';
import type {UserDocument} from '../../modules/user/user.model.js';
import {HttpError} from './http-error.js';

export function currentUser(res: Response): UserDocument | undefined {
  return res.locals.user;
}

export function requireUser(res: Response): UserDocument {
  const user = currentUser(res);
  if (!user) {
    throw new HttpError(401, 'Требуется авторизация');
  }
  return user;
}
