import type {OfferView} from '../offer-service.interface.js';
import type {UserEntity} from '../../user/user.model.js';
import type {Types} from 'mongoose';
import {toUserRdo} from '../../user/rdo/user.rdo.js';
import type {UserRdo} from '../../user/rdo/user.rdo.js';
import type {Coordinates} from '../../../types/coordinates.type.js';

export type OfferPreviewRdo = {
  id: string;
  price: number;
  title: string;
  type: string;
  isFavorite: boolean;
  createdAt: string;
  city: string;
  previewImage: string;
  isPremium: boolean;
  rating: number;
  commentCount: number;
};

export type OfferRdo = OfferPreviewRdo & {
  description: string;
  images: string[];
  roomsCount: number;
  guestsCount: number;
  amenities: string[];
  location: Coordinates;
  author: UserRdo;
};

export function toOfferPreviewRdo(offer: OfferView): OfferPreviewRdo {
  return {
    id: String(offer._id),
    price: offer.rentPrice as number,
    title: offer.title as string,
    type: offer.housingType as string,
    isFavorite: offer.isFavorite,
    createdAt: (offer.date as Date).toISOString(),
    city: offer.city as string,
    previewImage: offer.previewImage as string,
    isPremium: offer.isPremium as boolean,
    rating: offer.rating as number,
    commentCount: offer.commentCount
  };
}

export function toOfferRdo(offer: OfferView): OfferRdo {
  return {
    ...toOfferPreviewRdo(offer),
    description: offer.description as string,
    images: offer.housingImages,
    roomsCount: offer.roomCount as number,
    guestsCount: offer.guestCount as number,
    amenities: offer.amenities,
    location: {
      latitude: (offer.coordinates as Coordinates).latitude,
      longitude: (offer.coordinates as Coordinates).longitude
    },
    author: toUserRdo(offer.author as unknown as UserEntity & {_id: Types.ObjectId})
  };
}
