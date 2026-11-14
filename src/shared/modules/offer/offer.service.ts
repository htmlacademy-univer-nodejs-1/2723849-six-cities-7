import { inject, injectable } from 'inversify';
import type { Model } from 'mongoose';
import type { IOfferService, CreateOfferData } from './offer-service.interface.js';
import type { OfferEntity, OfferDocument } from './offer.model.js';
import { TYPES } from '../../types/di.type.js';

@injectable()
export class OfferService implements IOfferService {
  constructor(
    @inject(TYPES.OfferModel)
    private readonly offerModel: Model<OfferEntity>
  ) {}

  async findById(id: string): Promise<OfferDocument | null> {
    return this.offerModel.findById(id).exec();
  }

  async create(data: CreateOfferData): Promise<OfferDocument> {
    return this.offerModel.create(data);
  }
}
