import {inject, injectable} from 'inversify';
import type {Model} from 'mongoose';
import type {FavouriteEntity, FavouriteDocument} from './favourite.model.js';
import type {OfferEntity} from '../offer/offer.model.js';
import type {OfferView} from '../offer/offer-service.interface.js';
import type {CreateFavouriteDto} from './dto/create-favourite.dto.js';
import type {IFavouriteService} from './favourite-service.interface.js';
import {TYPES} from '../../types/di.type.js';

@injectable()
export class FavouriteService implements IFavouriteService {
  constructor(
    @inject(TYPES.FavouriteModel) private readonly favouriteModel: Model<FavouriteEntity>,
    @inject(TYPES.OfferModel) private readonly offerModel: Model<OfferEntity>
  ) {}

  async create(dto: CreateFavouriteDto): Promise<FavouriteDocument> {
    if (!await this.offerModel.exists({_id: dto.offer})) {
      throw new Error('Offer not found');
    }
    return this.favouriteModel.create(dto);
  }

  delete(userId: string, offerId: string): Promise<FavouriteDocument | null> {
    return this.favouriteModel.findOneAndDelete({user: userId, offer: offerId}).exec();
  }

  async findByUserId(userId: string): Promise<OfferView[]> {
    const favourites = await this.favouriteModel.find({user: userId}).exec();
    const offers = await this.offerModel.find({_id: {$in: favourites.map((favourite) => favourite.offer)}}).sort({date: -1, _id: -1}).exec();
    return offers.map((offer) => ({...offer.toObject(), isFavorite: true}));
  }
}
