/**
 * Main entry point for the Weekly Weave Bot
 * 
 * This demonstrates how to use the modular bot framework
 * to create a specific bot implementation.
 */

import { createWeeklyWeaveBot } from './implementations/weekly-weave/index.js';
import { logger } from './utils/logger.js';

async function main() {
  try {
    logger.info('Starting Weekly Weave Bot...');
    
    // Create and initialize the bot
    const bot = await createWeeklyWeaveBot();
    await bot.initialize();
    
    // Start the bot
    await bot.start();
    
    logger.info('Bot is running!');
    
  } catch (error) {
    logger.error('Failed to start bot:', error);
    process.exit(1);
  }
}

main();