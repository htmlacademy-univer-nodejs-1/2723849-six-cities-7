import {model, Schema} from 'mongoose';
import type {InferSchemaType} from 'mongoose';

const sessionSchema = new Schema({
  tokenHash: {type: String, unique: true},
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  expiresAt: {type: Date, index: {expires: 0}}
}, {collection: 'sessions'});

export const SessionModel = model('Session', sessionSchema);
export type SessionEntity = InferSchemaType<typeof sessionSchema>;
