import {model, Schema} from 'mongoose';
import type {InferSchemaType, HydratedDocument} from 'mongoose';

const favouriteSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  offer: {type: Schema.Types.ObjectId, ref: 'Offer'}
}, {timestamps: true, collection: 'favourites'});

favouriteSchema.index({user: 1, offer: 1}, {unique: true});

export const FavouriteModel = model('Favourite', favouriteSchema);
export type FavouriteEntity = InferSchemaType<typeof favouriteSchema>;
export type FavouriteDocument = HydratedDocument<FavouriteEntity>;
