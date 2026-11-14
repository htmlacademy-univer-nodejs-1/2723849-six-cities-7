import { Schema, model } from 'mongoose';
import type { InferSchemaType, HydratedDocument } from 'mongoose';

const userSchema = new Schema({
  name: String,
  email: String,
  avatar: String,
  passwordHash: String,
  type: String,
}, {
  timestamps: true,
  collection: 'users'
});

export const UserModel = model('User', userSchema);
export type UserEntity = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<UserEntity>;
