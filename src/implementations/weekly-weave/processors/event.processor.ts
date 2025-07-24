import { 
  Processor, 
  ProcessorResult,
  AIProcessor,
  WebProcessor,
  WebContent 
} from '../../../core/processors/interfaces/processor.interface.js';
import { getConfig } from '../config/index.js';

export interface EventData {
  title: string;
  description?: string;
  venueName?: string;
  locationAddress?: string;
  startDatetime: Date;
  endDatetime?: Date;
  eventCost?: string;
  tags?: string[];
  sourceWebsite: string;
  organizerName?: string;
  organizerContact?: string;
  isLocal: boolean;
  category?: string;
}

export class EventProcessor implements Processor<string, EventData> {
  name = 'event-processor';
  description = 'Extracts event information from web content';
  
  constructor(
    private webProcessor: WebProcessor,
    private aiProcessor: AIProcessor
  ) {}
  
  async process(url: string): Promise<ProcessorResult<EventData>> {
    try {
      // First, get web content
      const webResult = await this.webProcessor.process(url);
      if (!webResult.success || !webResult.data) {
        return { success: false, error: 'Failed to fetch web content' };
      }
      
      const config = getConfig();
      const currentDate = new Date();
      
      // Prepare AI prompt
      const prompt = {
        system: 'You are an expert at extracting event information from web pages.',
        user: `Extract event information from this webpage. Current date: ${currentDate.toISOString()}
Location context: ${config.location.name}

Title: ${webResult.data.title}
Content: ${webResult.data.content}
Structured Data: ${JSON.stringify(webResult.data.structuredData)}

Return your response as a JSON object with these fields:
- title: Event name
- description: Brief description
- venueName: Venue or location name
- locationAddress: Full address
- startDatetime: ISO date string
- endDatetime: ISO date string (if available)
- eventCost: Cost information (free, $20, etc)
- tags: Array of relevant tags
- organizerName: Organizer name
- organizerContact: Contact info
- category: One of: ${config.categories.map(c => c.id).join(', ')}

For recurring events, use the next occurrence date.`,
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            venueName: { type: 'string' },
            locationAddress: { type: 'string' },
            startDatetime: { type: 'string' },
            endDatetime: { type: 'string' },
            eventCost: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            organizerName: { type: 'string' },
            organizerContact: { type: 'string' },
            category: { type: 'string' }
          },
          required: ['title', 'startDatetime']
        }
      };
      
      // Extract with AI
      const aiResult = await this.aiProcessor.process(prompt);
      if (!aiResult.success || !aiResult.data) {
        return { success: false, error: 'Failed to extract event data' };
      }
      
      // Process and validate the data
      const eventData: EventData = {
        ...aiResult.data,
        startDatetime: new Date(aiResult.data.startDatetime),
        endDatetime: aiResult.data.endDatetime ? new Date(aiResult.data.endDatetime) : undefined,
        sourceWebsite: url,
        isLocal: this.isLocalEvent(aiResult.data, config)
      };
      
      return {
        success: true,
        data: eventData,
        metadata: {
          processedAt: new Date(),
          processors: ['web', 'ai']
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  private isLocalEvent(data: any, config: any): boolean {
    const location = `${data.venueName} ${data.locationAddress}`.toLowerCase();
    return config.location.keywords.some((keyword: string) => 
      location.includes(keyword.toLowerCase())
    );
  }
  
  validate(input: string): boolean {
    try {
      new URL(input);
      return true;
    } catch {
      return false;
    }
  }
}