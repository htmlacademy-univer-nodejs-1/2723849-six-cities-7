import chalk from 'chalk';
import {ICommand} from './command.interface';

export class HelpCommand implements ICommand {
  execute(_args: string[]): void {
    console.info(`
        ${chalk.yellowBright.bold('CLI программа для подготовки данных.')}
        ${chalk.magentaBright.bold('Использование:')}
        ${chalk.greenBright('cli.js --<Команда> [--Аргументыы]')}
        ${chalk.magentaBright.bold('Команды:')}
        ${chalk.greenBright('--help')}: ${chalk.blueBright('Показать справку')}
        ${chalk.greenBright('--version')}: ${chalk.blueBright('Показать версию приложения')}
        ${chalk.greenBright('--import <path>')}: ${chalk.blueBright('Импортировать данные из TSV-файла')}
    `);
  }

  getName(): string {
    return '--help';
  }
}
