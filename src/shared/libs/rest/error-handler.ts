import type {ErrorRequestHandler} from 'express';
import {HttpError} from './http-error.js';

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({message: error.message});
    return;
  }
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
    res.status(409).json({message: 'Запись уже существует'});
    return;
  }
  if (error instanceof Error && (error.name === 'CastError' || error instanceof SyntaxError)) {
    res.status(400).json({message: 'Некорректный запрос'});
    return;
  }
  res.status(500).json({message: 'Внутренняя ошибка сервера'});
};
