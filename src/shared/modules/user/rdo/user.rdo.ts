import type {UserEntity} from '../user.model.js';
import type {Types} from 'mongoose';

export type UserRdo = {
  id: string;
  name: string;
  email: string;
  userType: 'regular' | 'pro';
  avatar: string;
};

export function toUserRdo(user: UserEntity & {_id: Types.ObjectId}): UserRdo {
  return {
    id: user._id.toString(),
    name: user.name as string,
    email: user.email as string,
    userType: user.type === 'pro' || user.type === 'Pro'
      ? 'pro'
      : 'regular',
    avatar: user.avatar ?? 'default-avatar.png'
  };
}
