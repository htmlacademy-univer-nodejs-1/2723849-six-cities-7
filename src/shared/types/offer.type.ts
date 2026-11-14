import {CityName} from './city-name.type';
import {HousingType} from './housing-type.type';
import {AmenitiesType} from './amenities-type.type';
import {User} from './user.type';
import {Coordinates} from './coordinates.type';

export type Offer = {
  title: string;
  description: string;
  date: Date;
  city: CityName
  previewImage: string;
  housingImages: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  housingType: HousingType;
  roomCount: number;
  guestCount: number;
  rentPrice: number;
  amenities: AmenitiesType[];
  author: User;
  coordinates: Coordinates
}
