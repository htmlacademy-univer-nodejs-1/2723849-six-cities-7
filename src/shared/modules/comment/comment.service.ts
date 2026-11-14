import {inject, injectable} from 'inversify';
import {Types} from 'mongoose';
import type {Model} from 'mongoose';
import type {CommentEntity, CommentDocument} from './comment.model.js';
import type {OfferEntity} from '../offer/offer.model.js';
import type {CreateCommentDto} from './dto/create-comment.dto.js';
import type {ICommentService} from './comment-service.interface.js';
import {TYPES} from '../../types/di.type.js';

@injectable()
export class CommentService implements ICommentService {
  constructor(
    @inject(TYPES.CommentModel) private readonly commentModel: Model<CommentEntity>,
    @inject(TYPES.OfferModel) private readonly offerModel: Model<OfferEntity>
  ) {}

  async create(dto: CreateCommentDto): Promise<CommentDocument> {
    if (!await this.offerModel.exists({_id: dto.offer})) {
      throw new Error('Offer not found');
    }
    const comment = await this.commentModel.create(dto);
    const [statistics] = await this.commentModel.aggregate<{commentCount: number; rating: number}>([
      {$match: {offer: new Types.ObjectId(String(dto.offer))}},
      {$group: {_id: '$offer', commentCount: {$sum: 1}, rating: {$avg: '$rating'}}}
    ]).exec();
    await this.offerModel.findByIdAndUpdate(dto.offer, {$set: {
      commentCount: statistics.commentCount,
      rating: Math.round(statistics.rating * 10) / 10
    }}).exec();
    return comment.populate('author');
  }

  findByOfferId(offerId: string): Promise<CommentDocument[]> {
    return this.commentModel.find({offer: offerId}).sort({createdAt: -1, _id: -1}).limit(50).populate('author').exec();
  }
}
