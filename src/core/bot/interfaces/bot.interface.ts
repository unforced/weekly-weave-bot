/**
 * Core bot interfaces that work across different platforms (Telegram, Discord, etc.)
 */

export interface BotContext<T = any> {
  platform: 'telegram' | 'discord' | 'slack';
  userId?: string;
  chatId?: string;
  messageId?: string;
  text?: string;
  originalContext: T; // Platform-specific context
  
  // Services injected by the bot
  services?: BotServices;
}

export interface BotServices {
  storage?: any;
  processors?: Map<string, any>;
  synthesizers?: Map<string, any>;
  [key: string]: any;
}

export interface BotMessage {
  text?: string;
  media?: BotMedia[];
  buttons?: BotButton[][];
  parseMode?: 'markdown' | 'html';
}

export interface BotMedia {
  type: 'photo' | 'document' | 'video';
  source: string | Buffer;
  filename?: string;
  caption?: string;
}

export interface BotButton {
  text: string;
  callback?: string;
  url?: string;
}

export interface BotResponse {
  reply(message: BotMessage): Promise<void>;
  react(emoji: string): Promise<void>;
  edit(message: BotMessage): Promise<void>;
  delete(): Promise<void>;
}

export interface BotCommand {
  name: string;
  description: string;
  category?: string;
  permissions?: string[];
  handler: CommandHandler;
}

export type CommandHandler = (
  ctx: BotContext,
  args: string[],
  response: BotResponse
) => Promise<void>;

export interface BotPlatform {
  name: string;
  
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  
  registerCommand(command: BotCommand): void;
  registerMiddleware(middleware: Middleware): void;
  
  onMessage(handler: MessageHandler): void;
  onCallback(handler: CallbackHandler): void;
}

export type Middleware = (
  ctx: BotContext,
  next: () => Promise<void>
) => Promise<void>;

export type MessageHandler = (
  ctx: BotContext,
  response: BotResponse
) => Promise<void>;

export type CallbackHandler = (
  ctx: BotContext,
  data: string,
  response: BotResponse
) => Promise<void>;

export interface BotConfig {
  platform: 'telegram' | 'discord' | 'slack';
  credentials: Record<string, string>;
  services?: BotServices;
  commands?: BotCommand[];
  middleware?: Middleware[];
}