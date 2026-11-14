export interface ICommand {
  getName(): string;
  execute(args: string[]): void;
}
