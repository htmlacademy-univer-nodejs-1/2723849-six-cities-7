import type {UserDocument} from '../user.model.js';

export type UserRdo = {
  id: string;
  name: string;
  email: string;
  userType: 'regular' | 'pro';
  avatar: string;
};

export function toUserRdo(user: UserDocument): UserRdo {
  return {
    id: user._id.toString(),
    name: user.name!,
    email: user.email!,
    userType: user.type === 'pro' || user.type === 'Pro'
      ? 'pro'
      : 'regular',
    avatar: user.avatar ?? 'default-avatar.png'
  };
}
