import { 
  NewsletterGeneratorInterface, 
  NewsletterOptions, 
  NewsletterOutput, 
  NewsletterData,
  NewsletterTemplate,
  EventItem,
  UpdateItem,
  ContentItem
} from '../interfaces/newsletter.interface.js';
import { StorageInterface, EventData, UpdateData, ContentData } from '../interfaces/storage.interface.js';
import { format, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { templates } from './templates/index.js';

export class NewsletterGenerator implements NewsletterGeneratorInterface {
  constructor(private storage: StorageInterface) {}

  async generateNewsletter(options: NewsletterOptions): Promise<NewsletterOutput> {
    try {
      const data = await this.fetchNewsletterData(options);
      const template = await this.getTemplate(options.template || 'default');
      
      if (!template) {
        throw new Error(`Template not found: ${options.template}`);
      }

      const html = this.generateHTML(data, template);
      const markdown = this.generateMarkdown(data, template);

      return {
        html,
        markdown,
        json: data,
        metadata: {
          generatedAt: new Date(),
          template: template.name,
          itemCount: {
            events: data.events.length,
            updates: data.updates.length,
            content: data.content.length
          }
        }
      };
    } catch (error) {
      throw error;
    }
  }

  generateHTML(data: NewsletterData, template?: NewsletterTemplate): string {
    const tpl = template || templates.default;
    const sections: string[] = [];

    // Add header
    sections.push(this.processTemplate(tpl.header, data));

    // Group and add events by date if requested
    if (data.events.length > 0) {
      const groupedEvents = this.groupEventsByDate(data.events);
      
      for (const [dateKey, events] of Object.entries(groupedEvents)) {
        const dayData = {
          date: new Date(dateKey),
          dateFormatted: format(new Date(dateKey), 'EEEE, MMMM d'),
          events
        };
        
        sections.push(this.processTemplate(tpl.dayGroupFormat, dayData));
        
        for (const event of events) {
          sections.push(this.processTemplate(tpl.eventFormat, event));
        }
      }
    }

    // Add updates section
    if (data.updates.length > 0) {
      sections.push('<h2>Updates & News</h2>');
      for (const update of data.updates) {
        sections.push(this.processTemplate(tpl.updateFormat, update));
      }
    }

    // Add content section
    if (data.content.length > 0) {
      sections.push('<h2>Featured Content</h2>');
      for (const content of data.content) {
        sections.push(this.processTemplate(tpl.contentFormat, content));
      }
    }

    // Add footer
    sections.push(this.processTemplate(tpl.footer, data));

    // Wrap in HTML document with styles
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.title}</title>
  <style>${tpl.styles || this.getDefaultStyles()}</style>
</head>
<body>
  <div class="newsletter-container">
    ${sections.join('\n')}
  </div>
</body>
</html>`;
  }

  generateMarkdown(data: NewsletterData, template?: NewsletterTemplate): string {
    const sections: string[] = [];
    
    // Title and header
    sections.push(`# ${data.title}`);
    sections.push(`\n*${format(data.dateRange.start, 'MMMM d')} - ${format(data.dateRange.end, 'MMMM d, yyyy')}*\n`);
    
    // Events by date
    if (data.events.length > 0) {
      sections.push('## Events');
      const groupedEvents = this.groupEventsByDate(data.events);
      
      for (const [dateKey, events] of Object.entries(groupedEvents)) {
        sections.push(`\n### ${format(new Date(dateKey), 'EEEE, MMMM d')}\n`);
        
        for (const event of events) {
          sections.push(this.formatEventMarkdown(event));
        }
      }
    }

    // Updates
    if (data.updates.length > 0) {
      sections.push('\n## Updates & News\n');
      for (const update of data.updates) {
        sections.push(`- **${update.oneLiner}**: ${update.summary} [Read more](${update.sourceWebsite})`);
      }
    }

    // Content
    if (data.content.length > 0) {
      sections.push('\n## Featured Content\n');
      for (const content of data.content) {
        sections.push(`- **${content.oneLiner}**: ${content.summary} [Link](${content.sourceWebsite})`);
      }
    }

    return sections.join('\n');
  }

  async getAvailableTemplates(): Promise<NewsletterTemplate[]> {
    return Object.values(templates);
  }

  async getTemplate(name: string): Promise<NewsletterTemplate | null> {
    return templates[name] || null;
  }

  private async fetchNewsletterData(options: NewsletterOptions): Promise<NewsletterData> {
    const [events, updates, content] = await Promise.all([
      options.includeEvents !== false 
        ? this.storage.getEventsByDateRange(options.startDate, options.endDate, options.locationFilter)
        : [],
      options.includeUpdates 
        ? this.storage.getUpdatesByDateRange(options.startDate, options.endDate)
        : [],
      options.includeContent 
        ? this.storage.getContentByDateRange(options.startDate, options.endDate)
        : []
    ]);

    // Convert to newsletter items
    const eventItems: EventItem[] = events.map(e => ({
      ...e,
      registrationLink: e.sourceWebsite
    }));

    const updateItems: UpdateItem[] = updates.map(u => ({
      ...u,
      date: u.createdAt
    }));

    const contentItems: ContentItem[] = content.map(c => ({
      ...c,
      date: c.createdAt
    }));

    return {
      title: options.title || `Weekly Newsletter: ${format(options.startDate, 'MMMM d')} - ${format(options.endDate, 'MMMM d')}`,
      dateRange: {
        start: options.startDate,
        end: options.endDate
      },
      events: eventItems,
      updates: updateItems,
      content: contentItems,
      metadata: {
        location: options.locationFilter,
        introduction: options.introduction,
        conclusion: options.conclusion
      }
    };
  }

  private groupEventsByDate(events: EventItem[]): Record<string, EventItem[]> {
    const grouped: Record<string, EventItem[]> = {};
    
    for (const event of events) {
      const dateKey = format(startOfDay(event.startDatetime), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    }

    // Sort events within each day by time
    for (const events of Object.values(grouped)) {
      events.sort((a, b) => a.startDatetime.getTime() - b.startDatetime.getTime());
    }

    return grouped;
  }

  private processTemplate(template: string, data: any): string {
    // Simple template processing - replace {{variable}} with data values
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      if (key === 'date' && data.date) {
        return format(data.date, 'EEEE, MMMM d');
      }
      if (key === 'time' && data.startDatetime) {
        return format(data.startDatetime, 'h:mm a');
      }
      if (key === 'endTime' && data.endDatetime) {
        return format(data.endDatetime, 'h:mm a');
      }
      return data[key] || '';
    });
  }

  private formatEventMarkdown(event: EventItem): string {
    const time = format(event.startDatetime, 'h:mm a');
    const endTime = event.endDatetime ? ` - ${format(event.endDatetime, 'h:mm a')}` : '';
    const location = event.venueName ? ` @ ${event.venueName}` : '';
    const cost = event.eventCost ? ` (${event.eventCost})` : '';
    
    return `**[${event.title}](${event.sourceWebsite})** - ${time}${endTime}${location}${cost}\n${event.description || ''}\n`;
  }

  private getDefaultStyles(): string {
    return `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      h1, h2, h3 {
        color: #2c3e50;
      }
      a {
        color: #3498db;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      .event {
        margin-bottom: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 5px;
      }
      .event-time {
        font-weight: bold;
        color: #7f8c8d;
      }
      .event-location {
        color: #95a5a6;
        font-style: italic;
      }
    `;
  }
}