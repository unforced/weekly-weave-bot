import { Context } from 'telegraf';
import { BotCommand } from '../interfaces/bot.interface.js';
import { StorageInterface } from '../interfaces/storage.interface.js';
import { ScraperInterface } from '../interfaces/scraper.interface.js';
import { NewsletterGeneratorInterface } from '../interfaces/newsletter.interface.js';
import { logger } from '../utils/logger.js';
import { loadConfig } from '../utils/config.js';
import { startOfWeek, endOfWeek, addDays, format } from 'date-fns';
import * as fs from 'fs/promises';
import * as path from 'path';

interface CommandContext extends Context {
  storage: StorageInterface;
  scraper: ScraperInterface;
  newsletterGenerator?: NewsletterGeneratorInterface;
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

export const generateNewsletterCommand: BotCommand = {
  command: 'generate_newsletter',
  description: 'Generate a newsletter for the current week',
  handler: async (ctx: CommandContext) => {
    if (!ctx.newsletterGenerator) {
      await ctx.reply('❌ Newsletter generator not configured.');
      return;
    }
    
    const messageText = (ctx.message && 'text' in ctx.message) ? ctx.message.text : '';
    const args = messageText.split(' ').slice(1);
    const template = args[0] || 'default';
    
    await ctx.reply('🔄 Generating newsletter...');
    
    try {
      const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
      const endDate = endOfWeek(new Date(), { weekStartsOn: 1 }); // Sunday
      
      const newsletter = await ctx.newsletterGenerator.generateNewsletter({
        startDate,
        endDate,
        template,
        title: `Weekly Newsletter: ${format(startDate, 'MMMM d')} - ${format(endDate, 'MMMM d')}`,
        locationFilter: 'Boulder'
      });
      
      // Save to local file
      const outputDir = path.join(process.cwd(), 'newsletters');
      await fs.mkdir(outputDir, { recursive: true });
      
      const filename = `newsletter-${format(startDate, 'yyyy-MM-dd')}.html`;
      const filepath = path.join(outputDir, filename);
      await fs.writeFile(filepath, newsletter.html);
      
      const summary = `✅ Newsletter generated successfully!

📅 Period: ${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}
📝 Template: ${template}
📊 Events: ${newsletter.metadata.itemCount.events}
📰 Updates: ${newsletter.metadata.itemCount.updates}
📄 Content: ${newsletter.metadata.itemCount.content}

💾 Saved to: ${filename}`;
      
      await ctx.reply(summary, { parse_mode: 'Markdown' });
      
      // Send HTML file if small enough
      if (newsletter.html.length < 50000) {
        await ctx.replyWithDocument({ source: filepath, filename });
      }
    } catch (error) {
      logger.error('Error generating newsletter:', error);
      await ctx.reply('❌ Failed to generate newsletter.');
    }
  }
};

export const previewNewsletterCommand: BotCommand = {
  command: 'preview_newsletter',
  description: 'Preview newsletter in Markdown format',
  handler: async (ctx: CommandContext) => {
    if (!ctx.newsletterGenerator) {
      await ctx.reply('❌ Newsletter generator not configured.');
      return;
    }
    
    const messageText = (ctx.message && 'text' in ctx.message) ? ctx.message.text : '';
    const args = messageText.split(' ').slice(1);
    const template = args[0] || 'default';
    
    await ctx.reply('🔄 Generating preview...');
    
    try {
      const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      const endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
      
      const newsletter = await ctx.newsletterGenerator.generateNewsletter({
        startDate,
        endDate,
        template,
        title: `Weekly Newsletter Preview`,
        locationFilter: 'Boulder'
      });
      
      // Split markdown if too long for Telegram
      const markdown = newsletter.markdown;
      const maxLength = 4000;
      
      if (markdown.length <= maxLength) {
        await ctx.reply(markdown, { parse_mode: 'Markdown' });
      } else {
        // Split into multiple messages
        const parts = [];
        let currentPart = '';
        const lines = markdown.split('\n');
        
        for (const line of lines) {
          if (currentPart.length + line.length + 1 > maxLength) {
            parts.push(currentPart);
            currentPart = line;
          } else {
            currentPart += (currentPart ? '\n' : '') + line;
          }
        }
        if (currentPart) parts.push(currentPart);
        
        for (const part of parts) {
          await ctx.reply(part, { parse_mode: 'Markdown' });
        }
      }
    } catch (error) {
      logger.error('Error previewing newsletter:', error);
      await ctx.reply('❌ Failed to preview newsletter.');
    }
  }
};

export const listTemplatesCommand: BotCommand = {
  command: 'list_templates',
  description: 'List available newsletter templates',
  handler: async (ctx: CommandContext) => {
    if (!ctx.newsletterGenerator) {
      await ctx.reply('❌ Newsletter generator not configured.');
      return;
    }
    
    try {
      const templates = await ctx.newsletterGenerator.getAvailableTemplates();
      
      let message = '📋 Available Newsletter Templates:\n\n';
      for (const template of templates) {
        message += `**${template.name}**\n${template.description}\n\n`;
      }
      
      await ctx.reply(message, { parse_mode: 'Markdown' });
    } catch (error) {
      logger.error('Error listing templates:', error);
      await ctx.reply('❌ Failed to list templates.');
    }
  }
};