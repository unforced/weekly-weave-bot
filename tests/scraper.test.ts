import { IntelligentScraper } from '../src/scrapers/intelligent-scraper.js';
import { WebScraper } from '../src/scrapers/web-scraper.js';

describe('IntelligentScraper', () => {
  let scraper: IntelligentScraper;
  
  beforeAll(() => {
    scraper = new IntelligentScraper();
  });
  
  describe('Event Platform Scraping', () => {
    // Note: These are integration tests that make real API calls
    // They should be run periodically to ensure compatibility
    
    test.skip('should scrape Luma events', async () => {
      // Skip by default to avoid making real API calls in CI
      const lumaUrl = 'https://lu.ma/sample-event'; // Replace with real URL
      const event = await scraper.scrapeEvent(lumaUrl);
      
      expect(event).toBeDefined();
      expect(event.title).toBeTruthy();
      expect(event.startDatetime).toBeInstanceOf(Date);
      expect(event.sourceWebsite).toBe(lumaUrl);
    });
    
    test.skip('should scrape Eventbrite events', async () => {
      const eventbriteUrl = 'https://www.eventbrite.com/e/sample-event'; // Replace with real URL
      const event = await scraper.scrapeEvent(eventbriteUrl);
      
      expect(event).toBeDefined();
      expect(event.title).toBeTruthy();
      expect(event.startDatetime).toBeInstanceOf(Date);
      expect(event.sourceWebsite).toBe(eventbriteUrl);
    });
    
    test.skip('should scrape Meetup events', async () => {
      const meetupUrl = 'https://www.meetup.com/sample-group/events/123456/'; // Replace with real URL
      const event = await scraper.scrapeEvent(meetupUrl);
      
      expect(event).toBeDefined();
      expect(event.title).toBeTruthy();
      expect(event.startDatetime).toBeInstanceOf(Date);
      expect(event.sourceWebsite).toBe(meetupUrl);
    });
  });
  
  describe('Error Handling', () => {
    test('should handle invalid URLs gracefully', async () => {
      await expect(scraper.scrapeEvent('not-a-url')).rejects.toThrow();
    });
    
    test('should handle 404 pages', async () => {
      const nonExistentUrl = 'https://example.com/this-page-does-not-exist-12345';
      await expect(scraper.scrapeEvent(nonExistentUrl)).rejects.toThrow();
    });
  });
});

describe('WebScraper', () => {
  let webScraper: WebScraper;
  
  beforeAll(() => {
    webScraper = new WebScraper();
  });
  
  test('should extract basic page data', async () => {
    const pageData = await webScraper.fetchPage('https://example.com');
    
    expect(pageData).toBeDefined();
    expect(pageData.url).toBe('https://example.com');
    expect(pageData.text).toBeTruthy();
    expect(pageData.html).toBeTruthy();
  });
  
  test('should handle timeouts', async () => {
    // Mock a slow server
    jest.setTimeout(15000);
    await expect(
      webScraper.fetchPage('https://httpstat.us/200?sleep=15000')
    ).rejects.toThrow('Request timed out');
  });
});