import type {CityName} from '../../../types/city-name.type.js';
import type {HousingType} from '../../../types/housing-type.type.js';
import type {AmenitiesType} from '../../../types/amenities-type.type.js';
import type {Coordinates} from '../../../types/coordinates.type.js';
import type {CreateOfferDto} from './create-offer.dto.js';
import type {UpdateOfferDto} from './update-offer.dto.js';

export type CreateOfferBodyDto = {
  title: string;
  description: string;
  city: CityName;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  type: HousingType;
  roomsCount: number;
  guestsCount: number;
  price: number;
  amenities: AmenitiesType[];
  location: Coordinates;
};

export type UpdateOfferBodyDto = Partial<CreateOfferBodyDto>;

export function toOfferData(body: UpdateOfferBodyDto): UpdateOfferDto {
  const data: UpdateOfferDto = {};
  if (body.title !== undefined) {
    data.title = body.title;
  }
  if (body.description !== undefined) {
    data.description = body.description;
  }
  if (body.city !== undefined) {
    data.city = body.city;
  }
  if (body.previewImage !== undefined) {
    data.previewImage = body.previewImage;
  }
  if (body.images !== undefined) {
    data.housingImages = body.images;
  }
  if (body.isPremium !== undefined) {
    data.isPremium = body.isPremium;
  }
  if (body.type !== undefined) {
    data.housingType = body.type;
  }
  if (body.roomsCount !== undefined) {
    data.roomCount = body.roomsCount;
  }
  if (body.guestsCount !== undefined) {
    data.guestCount = body.guestsCount;
  }
  if (body.price !== undefined) {
    data.rentPrice = body.price;
  }
  if (body.amenities !== undefined) {
    data.amenities = body.amenities;
  }
  if (body.location !== undefined) {
    data.coordinates = body.location;
  }
  return data;
}

export function toCreateOfferData(body: CreateOfferBodyDto, author: CreateOfferDto['author']): CreateOfferDto {
  return {
    title: body.title,
    description: body.description,
    city: body.city,
    previewImage: body.previewImage,
    housingImages: body.images,
    isPremium: body.isPremium,
    housingType: body.type,
    roomCount: body.roomsCount,
    guestCount: body.guestsCount,
    rentPrice: body.price,
    amenities: body.amenities,
    coordinates: body.location,
    author
  };
}
