import { 
  QuerySynthesizer,
  SynthesisResult,
  Template,
  QueryOptions
} from '../../../core/synthesizers/interfaces/synthesizer.interface.js';
import { StorageProvider } from '../../../core/storage/interfaces/storage.interface.js';
import { getConfig } from '../config/index.js';
import { format, startOfWeek, endOfWeek } from 'date-fns';

export interface NewsletterOptions {
  startDate: Date;
  endDate: Date;
  template?: string;
  includeEvents?: boolean;
  includeUpdates?: boolean;
  includeContent?: boolean;
  locationFilter?: string;
}

export interface NewsletterOutput {
  html: string;
  markdown: string;
  json: {
    title: string;
    dateRange: { start: Date; end: Date };
    events: any[];
    updates: any[];
    content: any[];
  };
}

export class NewsletterSynthesizer implements QuerySynthesizer<NewsletterOptions, NewsletterOutput> {
  name = 'newsletter';
  description = 'Generates weekly newsletters from stored events and content';
  
  constructor(private storage: StorageProvider) {}
  
  buildQuery(options: NewsletterOptions): any {
    const queries = [];
    const config = getConfig();
    
    // Build event query
    if (options.includeEvents !== false) {
      queries.push({
        collection: 'events',
        query: {
          filters: {
            operator: 'and' as const,
            conditions: [
              {
                field: 'startDatetime',
                operator: 'gte' as const,
                value: options.startDate
              },
              {
                field: 'startDatetime',
                operator: 'lte' as const,
                value: options.endDate
              }
            ]
          },
          sort: [{ field: 'startDatetime', direction: 'asc' as const }]
        }
      });
    }
    
    // Build update query
    if (options.includeUpdates) {
      queries.push({
        collection: 'updates',
        query: {
          filters: {
            operator: 'and' as const,
            conditions: [
              {
                field: 'createdAt',
                operator: 'gte' as const,
                value: options.startDate
              },
              {
                field: 'createdAt',
                operator: 'lte' as const,
                value: options.endDate
              }
            ]
          },
          sort: [{ field: 'createdAt', direction: 'desc' as const }]
        }
      });
    }
    
    return queries;
  }
  
  async synthesize(options: QueryOptions<NewsletterOptions>): Promise<SynthesisResult<NewsletterOutput>> {
    const startTime = Date.now();
    
    try {
      const queries = this.buildQuery(options.query);
      
      // Fetch data from storage
      const [events, updates, content] = await Promise.all([
        options.query.includeEvents !== false 
          ? this.storage.find('events', queries[0].query)
          : [],
        options.query.includeUpdates 
          ? this.storage.find('updates', queries[1]?.query)
          : [],
        options.query.includeContent 
          ? this.storage.find('content', { /* similar query */ })
          : []
      ]);
      
      // Get template
      const template = await this.getTemplate(options.template || 'default');
      
      // Generate newsletter
      const data = {
        title: `Weekly Newsletter: ${format(options.query.startDate, 'MMMM d')} - ${format(options.query.endDate, 'MMMM d')}`,
        dateRange: {
          start: options.query.startDate,
          end: options.query.endDate
        },
        events,
        updates,
        content
      };
      
      const html = this.generateHTML(data, template);
      const markdown = this.generateMarkdown(data, template);
      
      return {
        success: true,
        output: {
          html,
          markdown,
          json: data
        },
        metadata: {
          generatedAt: new Date(),
          duration: Date.now() - startTime,
          itemCount: {
            events: events.length,
            updates: updates.length,
            content: content.length
          },
          template: template?.id
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          generatedAt: new Date(),
          duration: Date.now() - startTime
        }
      };
    }
  }
  
  async preview(options: QueryOptions<NewsletterOptions>): Promise<string> {
    const result = await this.synthesize(options);
    return result.success && result.output ? result.output.markdown : 'Preview failed';
  }
  
  async getTemplates(): Promise<Template[]> {
    return [
      {
        id: 'default',
        name: 'Default Template',
        description: 'Clean, modern newsletter format',
        variables: [
          {
            name: 'title',
            type: 'string',
            description: 'Newsletter title'
          },
          {
            name: 'introduction',
            type: 'string',
            description: 'Optional introduction text'
          }
        ]
      },
      {
        id: 'minimal',
        name: 'Minimal Template',
        description: 'Simple text-based format',
        variables: []
      }
    ];
  }
  
  private async getTemplate(id: string): Promise<Template | null> {
    const templates = await this.getTemplates();
    return templates.find(t => t.id === id) || null;
  }
  
  private generateHTML(data: any, template: Template | null): string {
    // Simplified HTML generation
    const sections = [];
    
    sections.push(`<h1>${data.title}</h1>`);
    
    if (data.events.length > 0) {
      sections.push('<h2>Events</h2>');
      for (const event of data.events) {
        sections.push(`
          <div class="event">
            <h3>${event.title}</h3>
            <p>${format(new Date(event.startDatetime), 'EEEE, MMMM d at h:mm a')}</p>
            <p>${event.venueName || ''}</p>
          </div>
        `);
      }
    }
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${data.title}</title>
        <style>
          body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .event { margin-bottom: 20px; padding: 15px; background: #f5f5f5; }
        </style>
      </head>
      <body>
        ${sections.join('\n')}
      </body>
      </html>
    `;
  }
  
  private generateMarkdown(data: any, template: Template | null): string {
    const sections = [];
    
    sections.push(`# ${data.title}\n`);
    
    if (data.events.length > 0) {
      sections.push('## Events\n');
      for (const event of data.events) {
        sections.push(`### ${event.title}`);
        sections.push(`${format(new Date(event.startDatetime), 'EEEE, MMMM d at h:mm a')}`);
        if (event.venueName) sections.push(`📍 ${event.venueName}`);
        sections.push('');
      }
    }
    
    return sections.join('\n');
  }
}