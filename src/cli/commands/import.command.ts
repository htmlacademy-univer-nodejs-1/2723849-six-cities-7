import {ICommand} from './command.interface.js';
import chalk from 'chalk';
import {TSVFileReader} from '../../shared/file-reader/tsv-file-reader.js';
import {inject, injectable} from 'inversify';
import {ILogger} from '../../shared/logger/logger.interface.js';
import {TYPES} from '../../shared/types/di.type.js';
import {IUserService} from '../../shared/modules/user/user-service.interface.js';
import {IOfferService} from '../../shared/modules/offer/offer-service.interface.js';
import {parseOffer} from '../../shared/helpers/offer.js';

@injectable()
export class ImportCommand implements ICommand {
  constructor(@inject(TYPES.Logger) private readonly logger: ILogger,
              @inject(TSVFileReader) private readonly reader: TSVFileReader,
              @inject(TYPES.OfferService) private readonly offerService: IOfferService,
              @inject(TYPES.UserService) private readonly userService: IUserService
  ) {
  }

  async execute(args: string[]): Promise<void> {
    const [filename] = args;
    if (!filename) {
      throw new Error(chalk.red('No filename provided'));
    }
    if (!filename.endsWith('.tsv')) {
      throw new Error(chalk.red('Expected tsv file'));
    }
    let count = 0;

    for await (const fields of this.reader.read(filename)) {
      const offer = parseOffer(fields);

      let author = await this.userService.findByEmail(offer.author.email);

      if (!author) {
        author = await this.userService.create({
          name: offer.author.name,
          email: offer.author.email,
          avatar: offer.author.avatar,
          password: offer.author.password,
          userType: offer.author.type === 'Pro' ? 'pro' : 'regular'
        });
      }

      await this.offerService.create({
        ...offer,
        author: author._id
      });

      count++;
    }

    console.log(chalk.green(`Imported ${count} offers`));
    this.logger.info('Imported successfully', {count, filename});
  }

  getName(): string {
    return '--import';
  }
}
