import { NewsletterGenerator } from '../src/newsletter/newsletter-generator';
import { StorageInterface, EventData, UpdateData, ContentData } from '../src/interfaces/storage.interface';
import { addDays, startOfWeek, endOfWeek } from 'date-fns';

// Mock storage implementation
class MockStorage implements StorageInterface {
  async initialize(): Promise<void> {}
  
  async saveEvent(data: EventData): Promise<{ id: string; url: string }> {
    return { id: '1', url: 'http://example.com/1' };
  }
  
  async saveUpdate(data: UpdateData): Promise<{ id: string; url: string }> {
    return { id: '2', url: 'http://example.com/2' };
  }
  
  async saveContent(data: ContentData): Promise<{ id: string; url: string }> {
    return { id: '3', url: 'http://example.com/3' };
  }
  
  async logError(): Promise<void> {}
  
  async getRecentEvents(limit?: number): Promise<EventData[]> {
    return [];
  }
  
  async getRecentUpdates(limit?: number): Promise<UpdateData[]> {
    return [];
  }
  
  async getRecentContent(limit?: number): Promise<ContentData[]> {
    return [];
  }
  
  async getEventsByDateRange(startDate: Date, endDate: Date, locationFilter?: string): Promise<EventData[]> {
    const now = new Date();
    return [
      {
        title: 'Boulder Poetry Reading',
        description: 'An evening of local poets sharing their work',
        venueName: 'Boulder Book Store',
        locationAddress: '1107 Pearl St, Boulder, CO',
        startDatetime: addDays(startDate, 1),
        endDatetime: addDays(startDate, 1),
        eventCost: 'Free',
        tags: ['poetry', 'literature'],
        sourceWebsite: 'https://example.com/poetry-reading',
        isBoulder: true,
        category: 'literary'
      },
      {
        title: 'Tech Meetup: AI and Ethics',
        description: 'Discussion on ethical AI development',
        venueName: 'Galvanize Boulder',
        startDatetime: addDays(startDate, 3),
        sourceWebsite: 'https://example.com/tech-meetup',
        isBoulder: true,
        category: 'tech'
      }
    ];
  }
  
  async getUpdatesByDateRange(startDate: Date, endDate: Date): Promise<UpdateData[]> {
    return [
      {
        content: 'Boulder announces new bike lane initiative',
        summary: 'The city of Boulder has announced plans for expanding bike lanes throughout downtown',
        oneLiner: 'Boulder Bike Lane Expansion',
        isBoulder: true,
        sourceWebsite: 'https://example.com/bike-lanes',
        createdAt: startDate
      }
    ];
  }
  
  async getContentByDateRange(startDate: Date, endDate: Date): Promise<ContentData[]> {
    return [
      {
        content: 'A guide to Boulder\'s best coffee shops',
        summary: 'Exploring the local coffee scene with reviews of top cafes',
        oneLiner: 'Boulder Coffee Guide',
        isBoulder: true,
        sourceWebsite: 'https://example.com/coffee-guide',
        createdAt: startDate
      }
    ];
  }
}

describe('NewsletterGenerator', () => {
  let generator: NewsletterGenerator;
  let storage: MockStorage;
  
  beforeEach(() => {
    storage = new MockStorage();
    generator = new NewsletterGenerator(storage);
  });
  
  describe('generateNewsletter', () => {
    it('should generate a newsletter with events, updates, and content', async () => {
      const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      const endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
      
      const result = await generator.generateNewsletter({
        startDate,
        endDate,
        includeEvents: true,
        includeUpdates: true,
        includeContent: true,
        template: 'default',
        locationFilter: 'Boulder'
      });
      
      expect(result).toBeDefined();
      expect(result.html).toContain('Boulder Poetry Reading');
      expect(result.html).toContain('Tech Meetup: AI and Ethics');
      expect(result.html).toContain('Boulder Bike Lane Expansion');
      expect(result.html).toContain('Boulder Coffee Guide');
      
      expect(result.metadata.itemCount.events).toBe(2);
      expect(result.metadata.itemCount.updates).toBe(1);
      expect(result.metadata.itemCount.content).toBe(1);
    });
  });
  
  describe('generateMarkdown', () => {
    it('should generate markdown format newsletter', async () => {
      const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      const endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
      
      const result = await generator.generateNewsletter({
        startDate,
        endDate,
        template: 'default'
      });
      
      expect(result.markdown).toContain('# Weekly Newsletter');
      expect(result.markdown).toContain('## Events');
      expect(result.markdown).toContain('Boulder Poetry Reading');
    });
  });
  
  describe('templates', () => {
    it('should support Oakland Review style template', async () => {
      const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      const endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
      
      const result = await generator.generateNewsletter({
        startDate,
        endDate,
        template: 'oakland-review'
      });
      
      expect(result.html).toContain('category-literary');
      expect(result.html).toContain('category-tech');
    });
    
    it('should list available templates', async () => {
      const templates = await generator.getAvailableTemplates();
      
      expect(templates.length).toBeGreaterThanOrEqual(2);
      expect(templates.some(t => t.name === 'default')).toBe(true);
      expect(templates.some(t => t.name === 'oakland-review')).toBe(true);
    });
  });
});