import {model, Schema} from 'mongoose';
import type {InferSchemaType, HydratedDocument} from 'mongoose';

const commentSchema = new Schema({
  text: String,
  rating: Number,
  author: {type: Schema.Types.ObjectId, ref: 'User'},
  offer: {type: Schema.Types.ObjectId, ref: 'Offer'}
}, {timestamps: true, collection: 'comments'});

export const CommentModel = model('Comment', commentSchema);
export type CommentEntity = InferSchemaType<typeof commentSchema>;
export type CommentDocument = HydratedDocument<CommentEntity>;
