import {ICommand} from './command.interface';
import chalk from 'chalk';
import {TSVFileReader} from '../../shared/file-reader/tsv-file-reader.js';

export class ImportCommand implements ICommand {
  async execute(args: string[]): Promise<void> {
    const [filename] = args;
    if (!filename) {
      throw new Error(chalk.red('No filename provided'));
    }
    if (!filename.endsWith('.tsv')) {
      throw new Error(chalk.red('Expected tsv file'));
    }
    const reader = new TSVFileReader();
    let count = 0;

    for await (const fields of reader.read(filename)) {
      if (fields.length !== 21) {
        throw new Error(`Некорректное количество полей в строке ${count + 1}`);
      }
      count++;
    }

    console.log(chalk.green(`Прочитано предложений: ${count}`));
  }

  getName(): string {
    return '--import';
  }
}
