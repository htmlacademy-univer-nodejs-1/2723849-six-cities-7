import type {CityName} from '../../../types/city-name.type.js';
import type {HousingType} from '../../../types/housing-type.type.js';
import type {AmenitiesType} from '../../../types/amenities-type.type.js';
import type {Coordinates} from '../../../types/coordinates.type.js';


import type {Types} from 'mongoose';

export type CreateOfferDto = {
  author: Types.ObjectId;
  date?: Date;
  title: string,
  description: string,
  city: CityName,
  previewImage: string,
  housingImages: string[],
  isPremium: boolean,
  housingType: HousingType,
  roomCount: number,
  guestCount: number,
  rentPrice: number,
  amenities: AmenitiesType[],
  coordinates: Coordinates,
}
