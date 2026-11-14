export interface ILogger {
  info(message: string, data?: object): void;
  warn(message: string, data?: object): void;
  error(message: string, error: unknown): void;
}
