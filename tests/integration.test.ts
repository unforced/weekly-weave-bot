import { IntelligentScraper } from '../src/scrapers/intelligent-scraper.js';
import { WebScraper } from '../src/scrapers/web-scraper.js';
import { AIExtractor } from '../src/scrapers/ai-extractor.js';
import axios from 'axios';
import OpenAI from 'openai';

// Mock dependencies
jest.mock('axios');
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}));

jest.mock('../src/utils/config.js', () => ({
  loadConfig: () => ({
    OPENAI_API_KEY: 'test-key',
    NODE_ENV: 'test',
    LOG_LEVEL: 'error',
  }),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('IntelligentScraper Integration Tests', () => {
  let scraper: IntelligentScraper;
  let mockOpenAI: any;
  
  beforeEach(() => {
    scraper = new IntelligentScraper();
    const aiExtractor = (scraper as any).aiExtractor;
    mockOpenAI = (aiExtractor as any).openai;
    jest.clearAllMocks();
  });
  
  test('should successfully scrape and extract event data', async () => {
    // Mock web scraping response
    const mockHtml = `
      <html>
        <head>
          <title>Boulder AI Meetup - December 2024</title>
          <meta name="description" content="Join us for talks on the latest AI developments">
          <script type="application/ld+json">
            {
              "@type": "Event",
              "name": "Boulder AI Meetup",
              "startDate": "2024-12-15T18:00:00-07:00",
              "location": {
                "@type": "Place",
                "name": "Boulder Innovation Center",
                "address": "1234 Pearl St, Boulder, CO"
              }
            }
          </script>
        </head>
        <body>
          <h1>Boulder AI Meetup</h1>
          <p>Date: December 15, 2024 at 6:00 PM MST</p>
          <p>Location: Boulder Innovation Center, 1234 Pearl St</p>
          <p>Cost: Free with RSVP</p>
          <p>Join us for an evening of AI discussions and networking!</p>
        </body>
      </html>
    `;
    
    mockedAxios.get.mockResolvedValueOnce({
      data: mockHtml,
      status: 200,
    });
    
    // Mock AI extraction response
    mockOpenAI.chat.completions.create.mockResolvedValueOnce({
      choices: [{
        message: {
          content: JSON.stringify({
            title: 'Boulder AI Meetup - December 2024',
            description: 'Join us for an evening of AI discussions and networking!',
            venueName: 'Boulder Innovation Center',
            locationAddress: '1234 Pearl St, Boulder, CO',
            startDatetime: '2024-12-15T18:00:00-07:00',
            eventCost: 'Free with RSVP',
            tags: ['AI', 'Technology', 'Networking'],
            organizerName: 'Boulder AI Group',
            isBoulder: true,
          }),
        },
      }],
    });
    
    const result = await scraper.scrapeEvent('https://example.com/boulder-ai-meetup');
    
    expect(result).toBeDefined();
    expect(result.title).toBe('Boulder AI Meetup - December 2024');
    expect(result.venueName).toBe('Boulder Innovation Center');
    expect(result.locationAddress).toBe('1234 Pearl St, Boulder, CO');
    expect(result.isBoulder).toBe(true);
    expect(result.startDatetime).toBeInstanceOf(Date);
    expect(result.sourceWebsite).toBe('https://example.com/boulder-ai-meetup');
    
    // Verify axios was called correctly
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://example.com/boulder-ai-meetup',
      expect.objectContaining({
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WeeklyWeaveBot/1.0)',
        },
        timeout: 10000,
      })
    );
    
    // Verify OpenAI was called with extracted content
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-4o-mini',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({ 
            role: 'user',
            content: expect.stringContaining('Boulder AI Meetup'),
          }),
        ]),
      })
    );
  });
  
  test('should handle scraping errors gracefully', async () => {
    const error = new Error('Request failed with status code 404') as any;
    error.response = { status: 404 };
    error.isAxiosError = true;
    
    mockedAxios.get.mockRejectedValueOnce(error);
    // Also need to mock axios.isAxiosError
    (axios as any).isAxiosError = (err: any) => err.isAxiosError === true;
    
    await expect(scraper.scrapeEvent('https://example.com/nonexistent'))
      .rejects.toThrow('Page not found (404)');
  });
  
  test('should handle AI extraction errors gracefully', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: '<html><body>Test</body></html>',
      status: 200,
    });
    
    mockOpenAI.chat.completions.create.mockRejectedValueOnce(
      new Error('OpenAI service unavailable')
    );
    
    await expect(scraper.scrapeEvent('https://example.com/test'))
      .rejects.toThrow('Failed to extract event information');
  });
});