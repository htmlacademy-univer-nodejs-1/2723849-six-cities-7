import {inject, injectable} from 'inversify';
import type {Request, Response} from 'express';
import {Controller} from '../../libs/rest/controller.abstract.js';
import {currentUser} from '../../libs/rest/auth.js';
import {TYPES} from '../../types/di.type.js';
import type {CityName} from '../../types/city-name.type.js';
import type {IOfferService} from '../offer/offer-service.interface.js';
import {toOfferPreviewRdo} from '../offer/rdo/offer.rdo.js';

@injectable()
export class CityController extends Controller {
  constructor(@inject(TYPES.OfferService) private readonly offerService: IOfferService) {
    super();
    this.addRoute({path: '/:city/premium', method: 'get', handler: this.premium});
  }

  private async premium(req: Request<Record<string, string>>, res: Response): Promise<void> {
    const offers = await this.offerService.findPremium(req.params.city as CityName, currentUser(res)?._id.toString());
    this.ok(res, offers.map(toOfferPreviewRdo));
  }
}
