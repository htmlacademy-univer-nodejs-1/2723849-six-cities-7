import type { ICommand } from './commands/command.interface.js';

export class CLIApplication {
  private commands = new Map<string, ICommand>();

  register(command: ICommand): void {
    this.commands.set(command.getName(), command);
  }

  async run(args: string[]): Promise<void> {
    const [name = '--help', ...params] = args;
    const command = this.commands.get(name);

    if (!command) {
      throw new Error(`Неизвестная команда: ${name}`);
    }

    await command.execute(params);
  }
}
