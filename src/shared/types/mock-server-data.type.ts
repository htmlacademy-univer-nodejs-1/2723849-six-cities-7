import {HousingType} from './housing-type.type';
import {AmenitiesType} from './amenities-type.type';
import {User} from './user.type';
import {City} from './city.type';

export type MockServerDataType = {
  titles: string[];
  descriptions: string[];
  postDates: Date[];
  cities: City[];
  previewImages: string[];
  images: string[];
  housingTypes: HousingType[];
  amenities: AmenitiesType[];
  users: User[]
}
