import {IUserService} from './user-service.interface.js';
import {inject, injectable} from 'inversify';
import {UserDocument, UserEntity} from './user.model.js';
import {Model} from 'mongoose';
import {TYPES} from '../../types/di.type.js';
import type {AppConfig} from '../../config/config.js';
import {scryptSync, timingSafeEqual} from 'node:crypto';
import type {CreateUserDto} from './dto/create-user.dto.js';


@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.UserModel) private readonly userModel: Model<UserEntity>,
    @inject(TYPES.Config) private readonly config: AppConfig
  ) {}

  async verifyPassword(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({email}).select('+passwordHash').exec();
    if (!user?.passwordHash) {
      return null;
    }
    const actual = Buffer.from(user.passwordHash, 'hex');
    const expected = Buffer.from(this.hashPassword(password), 'hex');
    if (actual.length !== expected.length || !timingSafeEqual(new Uint8Array(actual), new Uint8Array(expected))) {
      return null;
    }
    user.passwordHash = undefined;
    return user;
  }

  async create(dto: CreateUserDto): Promise<UserDocument> {
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      avatar: dto.avatar,
      passwordHash: this.hashPassword(dto.password),
      type: dto.userType
    });
    user.passwordHash = undefined;
    return user;
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({email}).exec();
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  private hashPassword(password: string): string {
    const salt = this.config.get('salt');

    if (salt.length === 0) {
      throw new Error('SALT must be a non-empty string');
    }

    return scryptSync(password, salt, 64).toString('hex');
  }

}
