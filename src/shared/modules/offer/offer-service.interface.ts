import type {CityName} from '../../types/city-name.type.js';
import type {OfferDocument, OfferEntity} from './offer.model.js';
import type {Types} from 'mongoose';
import type {CreateOfferDto} from './dto/create-offer.dto.js';
import type {UpdateOfferDto} from './dto/update-offer.dto.js';
import type {UpdateOfferStatisticsDto} from './dto/update-offer-statistics.dto.js';

export type OfferView = OfferEntity & {_id: Types.ObjectId; isFavorite: boolean};

export interface IOfferService {
  findById(id: string, userId?: string): Promise<OfferView | null>;
  find(limit?: number, userId?: string): Promise<OfferView[]>;
  findPremium(city: CityName, userId?: string): Promise<OfferView[]>;
  create(dto: CreateOfferDto): Promise<OfferDocument>;
  update(id: string, dto: UpdateOfferDto, authorId: string): Promise<OfferDocument | null>;
  delete(id: string, authorId: string): Promise<OfferDocument | null>;
  updateStatistics(id: string, dto: UpdateOfferStatisticsDto): Promise<OfferDocument | null>;
}
