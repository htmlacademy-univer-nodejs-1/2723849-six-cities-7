import {model, Schema} from 'mongoose';
import type { InferSchemaType, HydratedDocument } from 'mongoose';

const offerSchema = new Schema({
  title: String,
  description: String,
  date: Date,
  city: String,
  previewImage: String,
  housingImages: [String],
  isPremium: Boolean,
  isFavorite: Boolean,
  rating: Number,
  housingType: String,
  roomCount: Number,
  guestCount: Number,
  rentPrice: Number,
  amenities: [String],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  commentCount: {
    type: Number,
    default: 0
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  }
}, {
  timestamps: true,
  collection: 'offers'
});

export const OfferModel = model('Offer', offerSchema);
export type OfferEntity = InferSchemaType<typeof offerSchema>;
export type OfferDocument = HydratedDocument<OfferEntity>;
