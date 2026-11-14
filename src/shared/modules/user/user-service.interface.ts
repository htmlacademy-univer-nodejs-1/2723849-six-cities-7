import {UserDocument} from './user.model.js';

export type CreateUserData = {
  name: string,
  email: string,
  avatar?: string,
  passwordHash: string;
  type: string
};

export interface IUserService {
  findById(id: string): Promise<UserDocument | null>;
  findByEmail(email: string): Promise<UserDocument | null>;
  create(user: CreateUserData): Promise<UserDocument>;
}
