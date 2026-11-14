import {inject, injectable} from 'inversify';
import type {Request, Response} from 'express';
import {Types} from 'mongoose';
import {Controller} from '../../libs/rest/controller.abstract.js';
import {requireUser} from '../../libs/rest/auth.js';
import {HttpError} from '../../libs/rest/http-error.js';
import {TYPES} from '../../types/di.type.js';
import type {IFavouriteService} from './favourite-service.interface.js';
import type {IOfferService} from '../offer/offer-service.interface.js';
import {toOfferPreviewRdo} from '../offer/rdo/offer.rdo.js';

@injectable()
export class FavouriteController extends Controller {
  constructor(
    @inject(TYPES.FavouriteService) private readonly favouriteService: IFavouriteService,
    @inject(TYPES.OfferService) private readonly offerService: IOfferService
  ) {
    super();
    this.addRoute({path: '/', method: 'get', handler: this.index});
    this.addRoute({path: '/:offerId', method: 'post', handler: this.create});
    this.addRoute({path: '/:offerId', method: 'delete', handler: this.delete});
  }

  private async index(_req: Request, res: Response): Promise<void> {
    const offers = await this.favouriteService.findByUserId(String(requireUser(res)._id));
    this.ok(res, offers.map(toOfferPreviewRdo));
  }

  private async create(req: Request<Record<string, string>>, res: Response): Promise<void> {
    const user = requireUser(res);
    if (!await this.offerService.findById(req.params.offerId)) {
      throw new HttpError(404, 'Предложение не найдено');
    }
    await this.favouriteService.create({user: user._id, offer: new Types.ObjectId(req.params.offerId)});
    this.noContent(res);
  }

  private async delete(req: Request<Record<string, string>>, res: Response): Promise<void> {
    const userId = String(requireUser(res)._id);
    if (!await this.favouriteService.delete(userId, req.params.offerId)) {
      throw new HttpError(404, 'Предложение отсутствует в избранном');
    }
    this.noContent(res);
  }
}
