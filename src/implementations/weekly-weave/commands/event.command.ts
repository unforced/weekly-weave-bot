import { createCommand, rateLimit } from '../../../core/bot/builders/command.builder.js';
import { BotContext, BotResponse } from '../../../core/bot/interfaces/bot.interface.js';
import { EventProcessor } from '../processors/event.processor.js';

export const eventCommand = createCommand('event')
  .description('Submit an event link for tracking')
  .category('content')
  .argument({
    name: 'url',
    type: 'url',
    required: true,
    description: 'URL of the event page'
  })
  .examples(
    '/event https://lu.ma/example-event',
    '/event https://www.eventbrite.com/e/example-event'
  )
  .use(rateLimit(10)) // 10 requests per minute
  .handle(async (ctx: BotContext, args: string[], response: BotResponse) => {
    const url = args[0];
    
    await response.reply({
      text: '🔄 Processing event...'
    });
    
    try {
      // Get processor from context
      const processor = ctx.services?.processors?.get('event-processor') as EventProcessor;
      if (!processor) {
        throw new Error('Event processor not configured');
      }
      
      // Process the event
      const result = await processor.process(url);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to process event');
      }
      
      // Save to storage
      const storage = ctx.services?.storage;
      if (!storage) {
        throw new Error('Storage not configured');
      }
      
      const saved = await storage.create('events', result.data);
      
      // Format response
      const event = result.data;
      const message = {
        text: `✅ Event saved successfully!

**${event.title}**
📅 ${event.startDatetime.toLocaleDateString()}
📍 ${event.venueName || 'Location TBD'}
${event.isLocal ? '📍 Local Event' : '🌍 Non-local Event'}
💰 ${event.eventCost || 'Price TBD'}

${event.description ? event.description.substring(0, 200) + '...' : ''}`,
        parseMode: 'markdown' as const
      };
      
      await response.reply(message);
      
    } catch (error) {
      console.error('Error processing event:', error);
      
      // Log error if storage is available
      const storage = ctx.services?.storage;
      if (storage) {
        await storage.create('errors', {
          timestamp: new Date(),
          command: 'event',
          url,
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: ctx.userId
        });
      }
      
      await response.reply({
        text: '❌ Failed to process event. The error has been logged.'
      });
    }
  })
  .build();