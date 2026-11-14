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

export function parseOffer(fields: string[]): Offer {
  if (fields.length !== 21) {
    throw new Error('Expected 21 fields in TSV row');
  }

  const [
    title,
    description,
    date,
    city,
    previewImage,
    housingImages,
    isPremium,
    isFavorite,
    rating,
    housingType,
    roomCount,
    guestCount,
    rentPrice,
    amenities,
    name,
    email,
    avatar,
    password,
    userType,
    latitude,
    longitude
  ] = fields;

  return {
    title,
    description,
    date: new Date(date),
    city: city as Offer['city'],
    previewImage,
    housingImages: housingImages.split(';'),
    isPremium: isPremium === 'true',
    isFavorite: isFavorite === 'true',
    rating: Number(rating),
    housingType: housingType as Offer['housingType'],
    roomCount: Number(roomCount),
    guestCount: Number(guestCount),
    rentPrice: Number(rentPrice),
    amenities: amenities.split(';') as Offer['amenities'],
    author: {
      name,
      email,
      avatar,
      password,
      type: userType as Offer['author']['type']
    },
    coordinates: {
      latitude: Number(latitude),
      longitude: Number(longitude)
    }
  };
}


