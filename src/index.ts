import { TelegramBot } from './bot/telegram-bot.js';
import { AirtableStorage } from './storage/airtable-storage.js';
import { IntelligentScraper } from './scrapers/intelligent-scraper.js';
import { eventCommand, updateCommand, contentCommand, errorCommand, initCommand } from './bot/commands.js';
import { logger } from './utils/logger.js';

async function main() {
  try {
    logger.info('Starting Weekly Weave Bot...');
    
    // Initialize components
    const storage = new AirtableStorage();
    const scraper = new IntelligentScraper();
    const bot = new TelegramBot(storage, scraper);
    
    // Register commands
    bot.registerCommand(eventCommand);
    bot.registerCommand(updateCommand);
    bot.registerCommand(contentCommand);
    bot.registerCommand(errorCommand);
    bot.registerCommand(initCommand);
    
    // Start the bot
    await bot.start();
    
    logger.info('Bot is running!');
  } catch (error) {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  }
}

main();