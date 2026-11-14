import {ICommand} from './command.interface.js';
import {readFile} from 'node:fs/promises';
import chalk from 'chalk';
import {injectable} from 'inversify';

@injectable()
export class VersionCommand implements ICommand {
  async execute(_args: string[]): Promise<void> {
    const content = await readFile('package.json', 'utf8');
    const packageJson = JSON.parse(content) as { version: string };
    console.log(chalk.greenBright(packageJson.version));
  }

  getName(): string {
    return '--version';
  }
}
