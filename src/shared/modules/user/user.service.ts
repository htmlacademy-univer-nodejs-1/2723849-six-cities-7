import {CreateUserData, IUserService} from './user-service.interface.js';
import {inject, injectable} from 'inversify';
import {UserDocument, UserEntity} from './user.model.js';
import {Model} from 'mongoose';
import {TYPES} from '../../types/di.type.js';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.UserModel) private readonly userModel: Model<UserEntity>
  ) {}

  create(user: CreateUserData): Promise<UserDocument> {
    return this.userModel.create(user);
  }

  findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({email}).exec();
  }

  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

}
