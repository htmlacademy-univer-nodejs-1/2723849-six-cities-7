import {inject, injectable} from 'inversify';
import type {Request, Response} from 'express';
import {Controller} from '../../libs/rest/controller.abstract.js';
import {currentUser, requireUser} from '../../libs/rest/auth.js';
import {HttpError} from '../../libs/rest/http-error.js';
import {TYPES} from '../../types/di.type.js';
import type {IOfferService, OfferView} from './offer-service.interface.js';
import type {CreateOfferBodyDto, UpdateOfferBodyDto} from './dto/offer-body.dto.js';
import {toCreateOfferData, toOfferData} from './dto/offer-body.dto.js';
import {toOfferPreviewRdo, toOfferRdo} from './rdo/offer.rdo.js';


@injectable()
export class OfferController extends Controller {
  constructor(@inject(TYPES.OfferService) private readonly offerService: IOfferService) {
    super();
    this.addRoute({path: '/', method: 'get', handler: this.index});
    this.addRoute({path: '/:offerId', method: 'get', handler: this.show});
    this.addRoute({path: '/', method: 'post', handler: this.create});
    this.addRoute({path: '/:offerId', method: 'patch', handler: this.update});
    this.addRoute({path: '/:offerId', method: 'delete', handler: this.delete});
  }

  private async index(req: Request<object, unknown, unknown, {limit?: string}>, res: Response): Promise<void> {
    const limit = req.query.limit === undefined ? undefined : Number(req.query.limit);
    const offers = await this.offerService.find(limit, currentUser(res)?._id.toString());
    this.ok(res, offers.map(toOfferPreviewRdo));
  }

  private async show(req: Request<Record<string, string>>, res: Response): Promise<void> {
    const offer = await this.findOffer(req.params.offerId, currentUser(res)?._id.toString());
    this.ok(res, toOfferRdo(offer));
  }

  private async create(req: Request<object, unknown, CreateOfferBodyDto>, res: Response): Promise<void> {
    const user = requireUser(res);
    const created = await this.offerService.create(toCreateOfferData(req.body, user._id));
    const offer = await this.findOffer(String(created._id), String(user._id));
    this.created(res, toOfferRdo(offer));
  }

  private async update(req: Request<Record<string, string>, unknown, UpdateOfferBodyDto>, res: Response): Promise<void> {
    const userId = String(requireUser(res)._id);
    await this.requireOwner(req.params.offerId, userId);
    const updated = await this.offerService.update(req.params.offerId, toOfferData(req.body), userId);
    if (!updated) {
      throw new HttpError(404, 'Предложение не найдено');
    }
    this.ok(res, toOfferRdo(await this.findOffer(req.params.offerId, userId)));
  }

  private async delete(req: Request<Record<string, string>>, res: Response): Promise<void> {
    const userId = String(requireUser(res)._id);
    await this.requireOwner(req.params.offerId, userId);
    if (!await this.offerService.delete(req.params.offerId, userId)) {
      throw new HttpError(404, 'Предложение не найдено');
    }
    this.noContent(res);
  }

  private async findOffer(id: string, userId?: string): Promise<OfferView> {
    const offer = await this.offerService.findById(id, userId);
    if (!offer) {
      throw new HttpError(404, 'Предложение не найдено');
    }
    return offer;
  }

  private async requireOwner(id: string, userId: string): Promise<void> {
    const offer = await this.findOffer(id);
    const author = offer.author as unknown as {_id: unknown};
    if (String(author._id) !== userId) {
      throw new HttpError(403, 'Можно изменять только свои предложения');
    }
  }
}
