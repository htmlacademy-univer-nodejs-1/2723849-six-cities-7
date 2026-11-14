import {ICommand} from './command.interface.js';
import chalk from 'chalk';
import {TSVFileReader} from '../../shared/file-reader/tsv-file-reader.js';
import {inject, injectable} from 'inversify';
import {ILogger} from '../../shared/logger/logger.interface.js';
import {TYPES} from '../../shared/types/di.type.js';

@injectable()
export class ImportCommand implements ICommand {
  constructor(@inject(TYPES.Logger) private readonly logger: ILogger,
              @inject(TSVFileReader) private readonly reader: TSVFileReader
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
      if (fields.length !== 21) {
        throw new Error(`Incorrect count of fields: ${count + 1}, but 21 requires`);
      }
      count++;
    }

    console.log(chalk.green(`Imported ${count} offers`));
    this.logger.info('Imported successfully', {count, filename});
  }

  getName(): string {
    return '--import';
  }
}
