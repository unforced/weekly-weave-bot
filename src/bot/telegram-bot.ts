import { Telegraf, Context } from 'telegraf';
import { BotInterface, BotCommand } from '../interfaces/bot.interface.js';
import { StorageInterface } from '../interfaces/storage.interface.js';
import { ScraperInterface } from '../interfaces/scraper.interface.js';
import { NewsletterGeneratorInterface } from '../interfaces/newsletter.interface.js';
import { logger } from '../utils/logger.js';
import { loadConfig } from '../utils/config.js';

interface BotContext extends Context {
  storage?: StorageInterface;
  scraper?: ScraperInterface;
  newsletterGenerator?: NewsletterGeneratorInterface;
}

export class TelegramBot implements BotInterface {
  private bot: Telegraf<BotContext>;
  private commands: Map<string, BotCommand> = new Map();
  
  constructor(
    private storage: StorageInterface,
    private scraper: ScraperInterface,
    private newsletterGenerator?: NewsletterGeneratorInterface
  ) {
    const config = loadConfig();
    this.bot = new Telegraf<BotContext>(config.TELEGRAM_BOT_TOKEN);
    
    this.bot.use((ctx, next) => {
      ctx.storage = this.storage;
      ctx.scraper = this.scraper;
      ctx.newsletterGenerator = this.newsletterGenerator;
      return next();
    });
    
    this.setupErrorHandling();
  }
  
  private setupErrorHandling() {
    this.bot.catch((err, ctx) => {
      logger.error('Bot error:', err);
      ctx.reply('❌ An error occurred while processing your request.').catch(() => {});
    });
  }
  
  registerCommand(command: BotCommand): void {
    this.commands.set(command.command, command);
    this.bot.command(command.command, async (ctx) => {
      try {
        await command.handler(ctx);
      } catch (error) {
        logger.error(`Error in command ${command.command}:`, error);
        await ctx.reply('❌ Failed to process command. Please try again.');
      }
    });
  }
  
  async start(): Promise<void> {
    await this.storage.initialize();
    
    this.bot.help((ctx) => {
      const helpText = Array.from(this.commands.values())
        .map(cmd => `/${cmd.command} - ${cmd.description}`)
        .join('\n');
      ctx.reply(`Available commands:\n\n${helpText}`);
    });
    
    this.bot.launch();
    logger.info('Bot started successfully');
    
    process.once('SIGINT', () => this.stop());
    process.once('SIGTERM', () => this.stop());
  }
  
  async stop(): Promise<void> {
    this.bot.stop('SIGTERM');
    logger.info('Bot stopped gracefully');
  }
}