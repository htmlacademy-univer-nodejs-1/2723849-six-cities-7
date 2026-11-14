import type {Types} from 'mongoose';

export type CreateFavouriteDto = {
  user: Types.ObjectId;
  offer: Types.ObjectId;
};
