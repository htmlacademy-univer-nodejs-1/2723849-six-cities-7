import {ICommand} from './command.interface.js';
import axios from 'axios';
import {MockServerDataType} from '../../shared/types/mock-server-data.type.js';
import {createOffer, offerToTSV} from '../../shared/helpers/offer.js';
import {createWriteStream} from 'node:fs';
import { pipeline } from 'node:stream/promises';
import chalk from 'chalk';
import {inject, injectable} from 'inversify';
import {ILogger} from '../../shared/logger/logger.interface.js';
import {TYPES} from '../../shared/types/di.type.js';

@injectable()
export class GenerateCommand implements ICommand {
  constructor(@inject(TYPES.Logger) private readonly logger: ILogger) {
  }

  async execute(args: string[]): Promise<void> {
    const [count, filepath, url] = args;
    if (!count) {
      throw new Error('You must pass the <n> argument (n stands for count of offer instance to generate)');
    }
    if (!filepath) {
      throw new Error('You must pass the <filepath> argument (filepath stands for output file for generated offer )');
    }
    if (!url) {
      throw new Error('You must pass the <url> argument (url stands for server address from where command should get data for offer)');
    }
    const countNum = Number(count);
    if (!Number.isSafeInteger(countNum) || countNum <= 0) {
      throw new Error('<n> must be positive');
    }
    const response = await axios.get<MockServerDataType>(url);
    const data = response.data;
    await pipeline(
      generateRows(data, countNum),
      createWriteStream(filepath, {encoding: 'utf8'})
    );
    console.log(chalk.green(`Generated ${countNum} offers to ${filepath}`));
    this.logger.info(
      'Generated successfully',
      {count: countNum, filepath: filepath}
    );
  }

  getName(): string {
    return '--generate';
  }

}

function* generateRows(data: MockServerDataType, count: number) {
  for (let i = 0; i < count; i++) {
    yield `${offerToTSV(createOffer(data))}\n`;
  }
}
