import { Context } from 'telegraf';
import { BotCommand } from '../interfaces/bot.interface.js';
import { StorageInterface } from '../interfaces/storage.interface.js';
import { ScraperInterface } from '../interfaces/scraper.interface.js';
import { logger } from '../utils/logger.js';
import { loadConfig } from '../utils/config.js';

interface CommandContext extends Context {
  storage: StorageInterface;
  scraper: ScraperInterface;
}

function extractUrl(text: string): string | null {
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  return urlMatch ? urlMatch[0] : null;
}

export const eventCommand: BotCommand = {
  command: 'event',
  description: 'Submit an event link for tracking',
  handler: async (ctx: CommandContext) => {
    const messageText = (ctx.message && 'text' in ctx.message) ? ctx.message.text : '';
    const url = extractUrl(messageText);
    
    if (!url) {
      await ctx.reply('❌ Please provide a URL. Usage: /event <url>');
      return;
    }
    
    await ctx.reply('🔄 Processing event...');
    
    try {
      const eventData = await ctx.scraper.scrapeEvent(url);
      const result = await ctx.storage.saveEvent(eventData);
      
      const summary = `✅ Event saved successfully!

**${eventData.title}**
📅 ${eventData.startDatetime.toLocaleDateString()}
📍 ${eventData.venueName || 'Location TBD'}
${eventData.isBoulder ? '🏔️ Boulder Event' : '🌍 Non-Boulder Event'}

[View in Airtable](${result.url})`;
      
      await ctx.reply(summary, { parse_mode: 'Markdown' });
    } catch (error) {
      logger.error('Error processing event:', error);
      await ctx.storage.logError({
        timestamp: new Date(),
        command: 'event',
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: ctx.from?.id.toString()
      });
      await ctx.reply('❌ Failed to process event. The error has been logged.');
    }
  }
};

export const updateCommand: BotCommand = {
  command: 'update',
  description: 'Submit an update link for tracking',
  handler: async (ctx: CommandContext) => {
    const messageText = (ctx.message && 'text' in ctx.message) ? ctx.message.text : '';
    const url = extractUrl(messageText);
    
    if (!url) {
      await ctx.reply('❌ Please provide a URL. Usage: /update <url>');
      return;
    }
    
    await ctx.reply('🔄 Processing update...');
    
    try {
      const updateData = await ctx.scraper.scrapeUpdate(url);
      const result = await ctx.storage.saveUpdate(updateData);
      
      const summary = `✅ Update saved successfully!

**${updateData.oneLiner}**
${updateData.isBoulder ? '🏔️ Boulder Update' : '🌍 General Update'}

[View in Airtable](${result.url})`;
      
      await ctx.reply(summary, { parse_mode: 'Markdown' });
    } catch (error) {
      logger.error('Error processing update:', error);
      await ctx.storage.logError({
        timestamp: new Date(),
        command: 'update',
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: ctx.from?.id.toString()
      });
      await ctx.reply('❌ Failed to process update. The error has been logged.');
    }
  }
};

export const contentCommand: BotCommand = {
  command: 'content',
  description: 'Submit a content link for tracking',
  handler: async (ctx: CommandContext) => {
    const messageText = (ctx.message && 'text' in ctx.message) ? ctx.message.text : '';
    const url = extractUrl(messageText);
    
    if (!url) {
      await ctx.reply('❌ Please provide a URL. Usage: /content <url>');
      return;
    }
    
    await ctx.reply('🔄 Processing content...');
    
    try {
      const contentData = await ctx.scraper.scrapeContent(url);
      const result = await ctx.storage.saveContent(contentData);
      
      const summary = `✅ Content saved successfully!

**${contentData.oneLiner}**
${contentData.isBoulder ? '🏔️ Boulder Content' : '🌍 General Content'}

[View in Airtable](${result.url})`;
      
      await ctx.reply(summary, { parse_mode: 'Markdown' });
    } catch (error) {
      logger.error('Error processing content:', error);
      await ctx.storage.logError({
        timestamp: new Date(),
        command: 'content',
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: ctx.from?.id.toString()
      });
      await ctx.reply('❌ Failed to process content. The error has been logged.');
    }
  }
};

export const errorCommand: BotCommand = {
  command: 'error',
  description: 'Report an error with the last processed item',
  handler: async (ctx: CommandContext) => {
    if (!ctx.message || !('reply_to_message' in ctx.message) || !ctx.message.reply_to_message) {
      await ctx.reply('❌ Please reply to a bot message to report an error.');
      return;
    }
    
    const messageText = ('text' in ctx.message) ? ctx.message.text : '';
    const errorDetails = messageText.replace('/error', '').trim();
    
    if (!errorDetails) {
      await ctx.reply('❌ Please provide error details. Usage: /error <details>');
      return;
    }
    
    await ctx.storage.logError({
      timestamp: new Date(),
      command: 'user_reported',
      url: 'N/A',
      error: 'User reported error',
      userId: ctx.from?.id.toString(),
      details: errorDetails
    });
    
    await ctx.reply('✅ Error report submitted. Thank you for the feedback!');
  }
};

export const initCommand: BotCommand = {
  command: 'init',
  description: 'Initialize Airtable base (admin only)',
  handler: async (ctx: CommandContext) => {
    const config = loadConfig();
    const userId = ctx.from?.id.toString();
    
    if (!userId || !config.ADMIN_USER_IDS.includes(userId)) {
      await ctx.reply('❌ This command is restricted to administrators.');
      return;
    }
    
    await ctx.reply('🔄 Initializing Airtable base...');
    
    try {
      await ctx.storage.initialize();
      await ctx.reply('✅ Airtable base initialized successfully!');
    } catch (error) {
      logger.error('Error initializing Airtable:', error);
      await ctx.reply('❌ Failed to initialize Airtable base.');
    }
  }
};