export type CreateUserDto = {
  name: string;
  email: string;
  password: string;
  userType: 'regular' | 'pro';
  avatar?: string;
}
