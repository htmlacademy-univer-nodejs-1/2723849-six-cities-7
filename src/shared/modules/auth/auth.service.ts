import {createHash, randomBytes} from 'node:crypto';
import {inject, injectable} from 'inversify';
import type {Model} from 'mongoose';
import {TYPES} from '../../types/di.type.js';
import type {AppConfig} from '../../config/config.js';
import type {IUserService} from '../user/user-service.interface.js';
import type {UserDocument} from '../user/user.model.js';
import type {SessionEntity} from './session.model.js';

@injectable()
export class AuthService {
  constructor(
    @inject(TYPES.SessionModel) private readonly sessions: Model<SessionEntity>,
    @inject(TYPES.UserService) private readonly users: IUserService,
    @inject(TYPES.Config) private readonly config: AppConfig
  ) {}

  async createToken(user: UserDocument): Promise<string> {
    const token = randomBytes(32).toString('hex');
    await this.sessions.create({
      tokenHash: this.hash(token),
      user: user._id,
      expiresAt: new Date(Date.now() + this.config.get('authTokenTtl') * 1000)
    });
    return token;
  }

  async authenticate(token: string): Promise<UserDocument | null> {
    const session = await this.sessions.findOne({tokenHash: this.hash(token), expiresAt: {$gt: new Date()}}).exec();
    return session?.user ? this.users.findById(String(session.user)) : null;
  }

  async revoke(token: string): Promise<void> {
    await this.sessions.deleteOne({tokenHash: this.hash(token)}).exec();
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
