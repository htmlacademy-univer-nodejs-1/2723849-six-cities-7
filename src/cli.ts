#!/usr/bin/env node
import chalk from 'chalk';
import { CLIApplication } from './cli/cli-application.js';
import { HelpCommand } from './cli/commands/help.command.js';
import { VersionCommand } from './cli/commands/version.command.js';
import { ImportCommand } from './cli/commands/import.command.js';

const application = new CLIApplication();

application.register(new HelpCommand());
application.register(new VersionCommand());
application.register(new ImportCommand());

application.run(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error(chalk.red(`Ошибка: ${message}`));
  process.exitCode = 1;
});
