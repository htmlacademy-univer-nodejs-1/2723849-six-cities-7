import chalk from 'chalk';
import {ICommand} from './command.interface.js';
import {injectable} from 'inversify';

@injectable()
export class HelpCommand implements ICommand {
  execute(_args: string[]): void {
    console.info(`
        ${chalk.yellowBright.bold('CLI application for data preparation.')}
        ${chalk.magentaBright.bold('How to use:')}
        ${chalk.greenBright('cli.js --<Command> [--Arguments]')}
        ${chalk.magentaBright.bold('Commands:')}
        ${chalk.greenBright('--help')}: ${chalk.blueBright('Show info about all commands')}
        ${chalk.greenBright('--version')}: ${chalk.blueBright('Show application`s version')}
        ${chalk.greenBright('--import <path>  <mongodb-uri>')}: ${chalk.blueBright('Import data from TSV file')}
        ${chalk.greenBright('--generate <n> <filepath> <url>')}: ${chalk.blueBright('Generate n offers ' +
            'based on the server data from the URL and save them to the filepath')}
    `);
  }

  getName(): string {
    return '--help';
  }
}
