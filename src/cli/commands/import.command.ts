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
    const rows = await reader.read(filename);

    console.dir(rows, { depth: null });
  }

  getName(): string {
    return '--import';
  }
}
