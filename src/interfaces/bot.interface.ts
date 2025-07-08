export interface BotCommand {
  command: string;
  description: string;
  handler: (ctx: any, ...args: any[]) => Promise<void>;
}

export interface BotInterface {
  start(): Promise<void>;
  stop(): Promise<void>;
  registerCommand(command: BotCommand): void;
}