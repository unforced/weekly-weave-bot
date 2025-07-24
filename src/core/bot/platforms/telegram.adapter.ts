import { Telegraf, Context } from 'telegraf';
import { 
  BotPlatform, 
  BotContext, 
  BotCommand, 
  BotResponse,
  BotMessage,
  MessageHandler,
  CallbackHandler,
  Middleware,
  BotServices
} from '../interfaces/bot.interface.js';

export class TelegramAdapter implements BotPlatform {
  name = 'telegram' as const;
  private bot: Telegraf;
  private messageHandlers: MessageHandler[] = [];
  private callbackHandlers: CallbackHandler[] = [];
  
  constructor(
    private token: string,
    private services?: BotServices
  ) {
    this.bot = new Telegraf(token);
    this.setupErrorHandling();
  }
  
  private setupErrorHandling() {
    this.bot.catch((err, ctx) => {
      console.error('Bot error:', err);
      ctx.reply('❌ An error occurred while processing your request.').catch(() => {});
    });
  }
  
  async initialize(): Promise<void> {
    // Add services to context
    this.bot.use((ctx, next) => {
      const botCtx = this.createBotContext(ctx);
      (ctx as any).botContext = botCtx;
      return next();
    });
  }
  
  async start(): Promise<void> {
    this.bot.launch();
    
    process.once('SIGINT', () => this.stop());
    process.once('SIGTERM', () => this.stop());
  }
  
  async stop(): Promise<void> {
    this.bot.stop('SIGTERM');
  }
  
  registerCommand(command: BotCommand): void {
    this.bot.command(command.name, async (ctx) => {
      const botCtx = this.createBotContext(ctx);
      const args = ctx.message.text.split(' ').slice(1);
      const response = this.createBotResponse(ctx);
      
      try {
        await command.handler(botCtx, args, response);
      } catch (error) {
        console.error(`Error in command ${command.name}:`, error);
        await ctx.reply('❌ Failed to process command.');
      }
    });
  }
  
  registerMiddleware(middleware: Middleware): void {
    this.bot.use(async (ctx, next) => {
      const botCtx = this.createBotContext(ctx);
      await middleware(botCtx, next);
    });
  }
  
  onMessage(handler: MessageHandler): void {
    this.messageHandlers.push(handler);
    
    this.bot.on('text', async (ctx) => {
      const botCtx = this.createBotContext(ctx);
      const response = this.createBotResponse(ctx);
      
      for (const handler of this.messageHandlers) {
        await handler(botCtx, response);
      }
    });
  }
  
  onCallback(handler: CallbackHandler): void {
    this.callbackHandlers.push(handler);
    
    this.bot.on('callback_query', async (ctx) => {
      const botCtx = this.createBotContext(ctx);
      const response = this.createBotResponse(ctx);
      const data = ('data' in ctx.callbackQuery ? ctx.callbackQuery.data : null) || '';
      
      for (const handler of this.callbackHandlers) {
        await handler(botCtx, data, response);
      }
    });
  }
  
  private createBotContext(ctx: Context): BotContext {
    return {
      platform: 'telegram',
      userId: ctx.from?.id.toString(),
      chatId: ctx.chat?.id.toString(),
      messageId: ctx.message?.message_id.toString(),
      text: (ctx.message && 'text' in ctx.message) ? ctx.message.text : undefined,
      originalContext: ctx,
      services: this.services
    };
  }
  
  private createBotResponse(ctx: Context): BotResponse {
    return {
      async reply(message: BotMessage): Promise<void> {
        const options: any = {};
        
        if (message.parseMode) {
          options.parse_mode = message.parseMode === 'markdown' ? 'Markdown' : 'HTML';
        }
        
        if (message.buttons) {
          options.reply_markup = {
            inline_keyboard: message.buttons.map(row =>
              row.map(btn => ({
                text: btn.text,
                callback_data: btn.callback,
                url: btn.url
              }))
            )
          };
        }
        
        if (message.media?.length) {
          for (const media of message.media) {
            if (media.type === 'document') {
              await ctx.replyWithDocument(media.source as any, {
                caption: media.caption,
                ...options
              });
            } else if (media.type === 'photo') {
              await ctx.replyWithPhoto(media.source as any, {
                caption: media.caption,
                ...options
              });
            }
          }
        } else if (message.text) {
          await ctx.reply(message.text, options);
        }
      },
      
      async react(emoji: string): Promise<void> {
        if (ctx.message) {
          await ctx.react(emoji as any);
        }
      },
      
      async edit(message: BotMessage): Promise<void> {
        if (ctx.callbackQuery && message.text) {
          await ctx.editMessageText(message.text, {
            parse_mode: message.parseMode === 'markdown' ? 'Markdown' : 'HTML'
          });
        }
      },
      
      async delete(): Promise<void> {
        if (ctx.message) {
          await ctx.deleteMessage(ctx.message.message_id);
        }
      }
    };
  }
}