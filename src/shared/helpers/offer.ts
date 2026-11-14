import {MockServerDataType} from '../types/mock-server-data.type';
import {Offer} from '../types/offer.type';
import {getRandomItem, random} from './random.js';

export function createOffer(data: MockServerDataType): Offer {
  const cityData = getRandomItem(data.cities);
  const city = cityData.city;
  const coordinates = cityData.location;
  return {
    title: getRandomItem(data.titles),
    description: getRandomItem(data.descriptions),
    date: getRandomItem(data.postDates),
    city: city,
    previewImage: getRandomItem(data.previewImages),
    housingImages: data.images.slice(0, 6),
    isPremium: random(0, 2) !== 0,
    isFavorite: random(0, 2) !== 0,
    rating: random(10, 51) / 10,
    housingType: getRandomItem(data.housingTypes),
    roomCount: random(1, 9),
    guestCount: random(1, 11),
    rentPrice: random(100, 100001),
    amenities: data.amenities,
    author: getRandomItem(data.users),
    coordinates: coordinates,
  };
}

export function offerToTSV(offer: Offer): string {
  return [
    offer.title,
    offer.description,
    offer.date,
    offer.city,
    offer.previewImage,
    offer.housingImages.join(';'),
    offer.isPremium,
    offer.isFavorite,
    offer.rating,
    offer.housingType,
    offer.roomCount,
    offer.guestCount,
    offer.rentPrice,
    offer.amenities.join(';'),
    offer.author.name,
    offer.author.email,
    offer.author.avatar,
    offer.author.password,
    offer.author.type,
    offer.coordinates.latitude,
    offer.coordinates.longitude
  ].join('\t');
}

