import {inject, injectable} from 'inversify';
import type {Model} from 'mongoose';
import type {IOfferService, OfferView} from './offer-service.interface.js';
import type {OfferEntity, OfferDocument} from './offer.model.js';
import type {CommentEntity} from '../comment/comment.model.js';
import type {FavouriteEntity} from '../favourites/favourite.model.js';
import type {CreateOfferDto} from './dto/create-offer.dto.js';
import type {UpdateOfferDto} from './dto/update-offer.dto.js';
import type {UpdateOfferStatisticsDto} from './dto/update-offer-statistics.dto.js';
import type {CityName} from '../../types/city-name.type.js';
import {TYPES} from '../../types/di.type.js';

@injectable()
export class OfferService implements IOfferService {
  constructor(
    @inject(TYPES.OfferModel) private readonly offerModel: Model<OfferEntity>,
    @inject(TYPES.CommentModel) private readonly commentModel: Model<CommentEntity>,
    @inject(TYPES.FavouriteModel) private readonly favouriteModel: Model<FavouriteEntity>
  ) {}

  async findById(id: string, userId?: string): Promise<OfferView | null> {
    const offer = await this.offerModel.findById(id).populate('author').exec();
    return offer ? (await this.withFavourites([offer], userId))[0] : null;
  }

  async find(limit = 60, userId?: string): Promise<OfferView[]> {
    if (!Number.isInteger(limit) || limit < 1) {
      throw new Error('Limit must be a positive integer');
    }
    const offers = await this.offerModel.find().sort({date: -1, _id: -1}).limit(limit).exec();
    return this.withFavourites(offers, userId);
  }

  async findPremium(city: CityName, userId?: string): Promise<OfferView[]> {
    const offers = await this.offerModel.find({city, isPremium: true}).sort({date: -1, _id: -1}).limit(3).exec();
    return this.withFavourites(offers, userId);
  }

  create(dto: CreateOfferDto): Promise<OfferDocument> {
    return this.offerModel.create({...dto, rating: 0, commentCount: 0});
  }

  update(id: string, dto: UpdateOfferDto, authorId: string): Promise<OfferDocument | null> {
    return this.offerModel.findOneAndUpdate({_id: id, author: authorId}, {$set: dto}, {new: true}).exec();
  }

  async delete(id: string, authorId: string): Promise<OfferDocument | null> {
    const offer = await this.offerModel.findOneAndDelete({_id: id, author: authorId}).exec();
    if (offer) {
      await Promise.all([
        this.commentModel.deleteMany({offer: id}).exec(),
        this.favouriteModel.deleteMany({offer: id}).exec()
      ]);
    }
    return offer;
  }

  updateStatistics(id: string, dto: UpdateOfferStatisticsDto): Promise<OfferDocument | null> {
    return this.offerModel.findByIdAndUpdate(id, {$set: dto}, {new: true}).exec();
  }

  private async withFavourites(offers: OfferDocument[], userId?: string): Promise<OfferView[]> {
    const favourites = userId ? await this.favouriteModel.find({user: userId, offer: {$in: offers.map((offer) => offer._id)}}).exec() : [];
    const ids = new Set(favourites.map((favourite) => String(favourite.offer)));
    return offers.map((offer) => ({...offer.toObject(), isFavorite: ids.has(String(offer._id))}));
  }
}
