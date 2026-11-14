#!/usr/bin/env node
import 'reflect-metadata';
import { Application } from './application.js';
import { CLIApplication } from './cli/cli-application.js';
import { HelpCommand } from './cli/commands/help.command.js';
import { VersionCommand } from './cli/commands/version.command.js';
import { ImportCommand } from './cli/commands/import.command.js';
import { GenerateCommand } from './cli/commands/generate.command.js';
import type { ILogger } from './shared/logger/logger.interface.js';
import { container } from './container.js';
import {TYPES} from './shared/types/di.type.js';

const logger = container.get<ILogger>(TYPES.Logger);
const application = container.get(Application);
const cli = container.get(CLIApplication);

cli.register(container.get(ImportCommand));
cli.register(container.get(GenerateCommand));
cli.register(container.get(HelpCommand));
cli.register(container.get(VersionCommand));

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const uri = args[0] === '--import' ? args[2] : undefined;
  if (args[0] === '--import' && !uri) {
    throw new Error('Usage: --import <filepath> <mongodb-uri>');
  }

  await application.init(uri);
  try {
    await cli.run(args);
  } finally {
    await application.close();
  }
}

main().catch((error: unknown) => {
  logger.error('Application failed', error);
  process.exitCode = 1;
});
