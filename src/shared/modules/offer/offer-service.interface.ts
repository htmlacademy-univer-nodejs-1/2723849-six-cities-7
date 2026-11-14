import type { Types } from 'mongoose';
import type { Offer } from '../../types/offer.type.js';
import type { OfferDocument } from './offer.model.js';

export type CreateOfferData = Omit<Offer, 'author'> & {
  author: Types.ObjectId;
};

export interface IOfferService {
  findById(id: string): Promise<OfferDocument | null>;
  create(data: CreateOfferData): Promise<OfferDocument>;
}
