import { WebScraper } from '../src/scrapers/web-scraper.js';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WebScraper Unit Tests', () => {
  let webScraper: WebScraper;
  
  beforeEach(() => {
    webScraper = new WebScraper();
    jest.clearAllMocks();
  });
  
  describe('fetchPage', () => {
    test('should successfully fetch and parse HTML page', async () => {
      const mockHtml = `
        <html>
          <head>
            <title>Test Event Page</title>
            <meta name="description" content="Test description">
          </head>
          <body>
            <h1>Boulder Tech Meetup</h1>
            <p>Join us for an exciting tech meetup in Boulder!</p>
          </body>
        </html>
      `;
      
      mockedAxios.get.mockResolvedValueOnce({
        data: mockHtml,
        status: 200,
      });
      
      const result = await webScraper.fetchPage('https://example.com/event');
      
      expect(result.url).toBe('https://example.com/event');
      expect(result.title).toBe('Test Event Page');
      expect(result.description).toBe('Test description');
      expect(result.text).toContain('Boulder Tech Meetup');
      expect(result.text).toContain('Join us for an exciting tech meetup');
    });
    
    test('should extract OpenGraph metadata when available', async () => {
      const mockHtml = `
        <html>
          <head>
            <meta property="og:title" content="OG Title">
            <meta property="og:description" content="OG Description">
          </head>
          <body>Content</body>
        </html>
      `;
      
      mockedAxios.get.mockResolvedValueOnce({
        data: mockHtml,
        status: 200,
      });
      
      const result = await webScraper.fetchPage('https://example.com');
      
      expect(result.title).toBe('OG Title');
      expect(result.description).toBe('OG Description');
    });
    
    test('should handle 404 errors', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 404 },
        isAxiosError: true,
      });
      
      await expect(webScraper.fetchPage('https://example.com/404'))
        .rejects.toThrow('Page not found (404)');
    });
    
    test('should handle timeout errors', async () => {
      const timeoutError: any = new Error('timeout');
      timeoutError.code = 'ECONNABORTED';
      timeoutError.isAxiosError = true;
      
      mockedAxios.get.mockRejectedValueOnce(timeoutError);
      
      await expect(webScraper.fetchPage('https://slow-site.com'))
        .rejects.toThrow('Request timed out');
    });
    
    test('should clean script and style tags', async () => {
      const mockHtml = `
        <html>
          <body>
            <p>Visible content</p>
            <script>console.log('should be removed');</script>
            <style>body { color: red; }</style>
            <p>More visible content</p>
          </body>
        </html>
      `;
      
      mockedAxios.get.mockResolvedValueOnce({
        data: mockHtml,
        status: 200,
      });
      
      const result = await webScraper.fetchPage('https://example.com');
      
      expect(result.text).toContain('Visible content');
      expect(result.text).toContain('More visible content');
      expect(result.text).not.toContain('console.log');
      expect(result.text).not.toContain('color: red');
    });
  });
  
  describe('extractStructuredData', () => {
    test('should extract JSON-LD structured data', () => {
      const cheerio = require('cheerio');
      const $ = cheerio.load(`
        <html>
          <head>
            <script type="application/ld+json">
              {
                "@type": "Event",
                "name": "Boulder Tech Talk",
                "startDate": "2024-01-15T19:00:00"
              }
            </script>
          </head>
        </html>
      `);
      
      const structuredData = webScraper.extractStructuredData($);
      
      expect(structuredData['@type']).toBe('Event');
      expect(structuredData.name).toBe('Boulder Tech Talk');
      expect(structuredData.startDate).toBe('2024-01-15T19:00:00');
    });
    
    test('should handle invalid JSON-LD gracefully', () => {
      const cheerio = require('cheerio');
      const $ = cheerio.load(`
        <html>
          <head>
            <script type="application/ld+json">
              {invalid json
            </script>
          </head>
        </html>
      `);
      
      const structuredData = webScraper.extractStructuredData($);
      
      expect(structuredData).toEqual({});
    });
  });
});