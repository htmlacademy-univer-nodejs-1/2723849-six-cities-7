import type {CreateFavouriteDto} from './dto/create-favourite.dto.js';
import type {FavouriteDocument} from './favourite.model.js';
import type {OfferView} from '../offer/offer-service.interface.js';

export interface IFavouriteService {
  create(dto: CreateFavouriteDto): Promise<FavouriteDocument>;
  delete(userId: string, offerId: string): Promise<FavouriteDocument | null>;
  findByUserId(userId: string): Promise<OfferView[]>;
}
