import { Bot } from '../../core/bot/bot.factory.js';
import { createCommand } from '../../core/bot/builders/command.builder.js';
import { getConfig } from './config/index.js';

// Storage
import { AirtableStorageAdapter } from './storage/airtable.adapter.js';

// Processors
import { WebScraperProcessor } from './processors/web-scraper.processor.js';
import { AIExtractorProcessor } from './processors/ai-extractor.processor.js';
import { EventProcessor } from './processors/event.processor.js';

// Synthesizers
import { NewsletterSynthesizer } from './synthesizers/newsletter.synthesizer.js';

// Commands
import { eventCommand } from './commands/event.command.js';

export async function createWeeklyWeaveBot() {
  const config = getConfig();
  
  // Create storage
  const storage = new AirtableStorageAdapter({
    apiKey: process.env.AIRTABLE_API_KEY!,
    baseId: process.env.AIRTABLE_BASE_ID!,
    tables: config.storage.collections
  });
  
  // Create processors
  const webScraper = new WebScraperProcessor();
  const aiExtractor = new AIExtractorProcessor({
    apiKey: process.env.OPENAI_API_KEY!,
    model: config.processors.aiModel,
    temperature: config.processors.aiTemperature
  });
  const eventProcessor = new EventProcessor(webScraper, aiExtractor);
  
  // Create synthesizers
  const newsletterSynthesizer = new NewsletterSynthesizer(storage);
  
  // Build the bot
  const bot = Bot.create()
    .platform('telegram', { token: process.env.TELEGRAM_BOT_TOKEN! })
    .storage(storage)
    .processor(webScraper)
    .processor(aiExtractor)
    .processor(eventProcessor)
    .synthesizer(newsletterSynthesizer)
    .command(eventCommand);
  
  // Add newsletter command
  if (config.commands.newsletter) {
    const newsletterCommand = createCommand('newsletter')
      .description('Generate the weekly newsletter')
      .category('synthesis')
      .argument({
        name: 'template',
        type: 'string',
        required: false,
        default: config.newsletter.defaultTemplate,
        description: 'Newsletter template to use'
      })
      .handle(async (ctx, args, response) => {
        const synthesizer = ctx.services?.synthesizers?.get('newsletter') as NewsletterSynthesizer;
        if (!synthesizer) {
          throw new Error('Newsletter synthesizer not configured');
        }
        
        await response.reply({ text: '🔄 Generating newsletter...' });
        
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Monday
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6); // Sunday
        
        const result = await synthesizer.synthesize({
          query: {
            startDate,
            endDate,
            template: args[0],
            includeEvents: config.newsletter.includeEvents,
            includeUpdates: config.newsletter.includeUpdates,
            includeContent: config.newsletter.includeContent,
            locationFilter: config.location.name
          }
        });
        
        if (result.success && result.output) {
          // Send as document
          await response.reply({
            text: `✅ Newsletter generated!
📅 ${result.output.json.dateRange.start.toLocaleDateString()} - ${result.output.json.dateRange.end.toLocaleDateString()}
📊 Events: ${result.metadata?.itemCount?.events || 0}
📰 Updates: ${result.metadata?.itemCount?.updates || 0}`,
            media: [{
              type: 'document',
              source: Buffer.from(result.output.html),
              filename: `newsletter-${new Date().toISOString().split('T')[0]}.html`
            }]
          });
        } else {
          await response.reply({ text: '❌ Failed to generate newsletter' });
        }
      })
      .build();
    
    bot.command(newsletterCommand);
  }
  
  // Add admin commands
  if (config.commands.admin.init) {
    const initCommand = createCommand('init')
      .description('Initialize storage (admin only)')
      .category('admin')
      .permissions('admin')
      .handle(async (ctx, args, response) => {
        await response.reply({ text: '🔄 Initializing storage...' });
        
        const storage = ctx.services?.storage;
        if (!storage?.setup) {
          await response.reply({ text: '❌ Storage provider does not support setup' });
          return;
        }
        
        const result = await storage.setup();
        
        if (result.success) {
          await response.reply({ 
            text: `✅ ${result.message}\n\nCollections: ${result.collections?.join(', ')}` 
          });
        } else {
          await response.reply({ text: `❌ Setup failed: ${result.error}` });
        }
      })
      .build();
    
    bot.command(initCommand);
  }
  
  return bot.build();
}

// Export for direct use
export { Bot } from '../../core/bot/bot.factory.js';
export { createCommand } from '../../core/bot/builders/command.builder.js';
export * from '../../core/bot/interfaces/bot.interface.js';
export * from '../../core/processors/interfaces/processor.interface.js';
export * from '../../core/storage/interfaces/storage.interface.js';
export * from '../../core/synthesizers/interfaces/synthesizer.interface.js';