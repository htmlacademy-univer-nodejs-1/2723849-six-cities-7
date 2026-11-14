import type {CreateCommentDto} from './dto/create-comment.dto.js';
import type {CommentDocument} from './comment.model.js';

export interface ICommentService {
  create(dto: CreateCommentDto): Promise<CommentDocument>;
  findByOfferId(offerId: string): Promise<CommentDocument[]>;
}
