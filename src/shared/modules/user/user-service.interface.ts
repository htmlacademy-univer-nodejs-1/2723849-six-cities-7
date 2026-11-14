import type {UserDocument} from './user.model.js';
import type {CreateUserDto} from './dto/create-user.dto.js';

export interface IUserService {
  findById(id: string): Promise<UserDocument | null>;
  findByEmail(email: string): Promise<UserDocument | null>;
  create(dto: CreateUserDto): Promise<UserDocument>;
  verifyPassword(email: string, password: string): Promise<UserDocument | null>;
}
