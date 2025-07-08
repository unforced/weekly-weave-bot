import { AIExtractor } from '../src/scrapers/ai-extractor.js';
import OpenAI from 'openai';

// Mock OpenAI
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

// Mock config
jest.mock('../src/utils/config.js', () => ({
  loadConfig: () => ({
    OPENAI_API_KEY: 'test-key',
    NODE_ENV: 'test',
    LOG_LEVEL: 'error',
  }),
}));

describe('AIExtractor Unit Tests', () => {
  let aiExtractor: AIExtractor;
  let mockOpenAI: any;
  
  beforeEach(() => {
    aiExtractor = new AIExtractor();
    mockOpenAI = (aiExtractor as any).openai;
    jest.clearAllMocks();
  });
  
  describe('extractEvent', () => {
    test('should extract event data from page content', async () => {
      const mockPageData = {
        url: 'https://lu.ma/boulder-tech-meetup',
        title: 'Boulder Tech Meetup - January 2024',
        description: 'Join us for talks on AI and machine learning',
        text: 'Boulder Tech Meetup. January 15, 2024 at 6:00 PM. Location: Boulder Public Library. Free event.',
        html: '<html>...</html>',
      };
      
      const mockResponse = {
        title: 'Boulder Tech Meetup - January 2024',
        description: 'Join us for talks on AI and machine learning',
        venueName: 'Boulder Public Library',
        locationAddress: 'Boulder, CO',
        startDatetime: '2024-01-15T18:00:00',
        eventCost: 'Free',
        isBoulder: true,
      };
      
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify(mockResponse),
          },
        }],
      });
      
      const result = await aiExtractor.extractEvent(mockPageData);
      
      expect(result.title).toBe('Boulder Tech Meetup - January 2024');
      expect(result.venueName).toBe('Boulder Public Library');
      expect(result.isBoulder).toBe(true);
      expect(result.startDatetime).toBeInstanceOf(Date);
      expect(result.sourceWebsite).toBe('https://lu.ma/boulder-tech-meetup');
    });
    
    test('should handle AI extraction errors gracefully', async () => {
      const mockPageData = {
        url: 'https://example.com',
        title: 'Test',
        description: '',
        text: 'Some content',
        html: '<html>...</html>',
      };
      
      mockOpenAI.chat.completions.create.mockRejectedValueOnce(
        new Error('OpenAI API error')
      );
      
      await expect(aiExtractor.extractEvent(mockPageData))
        .rejects.toThrow('Failed to extract event information');
    });
    
    test('should handle empty AI response', async () => {
      const mockPageData = {
        url: 'https://example.com',
        title: 'Test',
        description: '',
        text: 'Some content',
        html: '<html>...</html>',
      };
      
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: null,
          },
        }],
      });
      
      await expect(aiExtractor.extractEvent(mockPageData))
        .rejects.toThrow('Failed to extract event information');
    });
  });
  
  describe('extractUpdate', () => {
    test('should extract update data with summary and one-liner', async () => {
      const mockPageData = {
        url: 'https://example.com/news/update',
        title: 'Major Update to Boulder Tech Scene',
        description: 'New incubator opens downtown',
        text: 'A new technology incubator has opened in downtown Boulder...',
        html: '<html>...</html>',
      };
      
      const mockResponse = {
        content: 'A new technology incubator has opened in downtown Boulder',
        summary: 'Boulder launches new tech incubator downtown to support startups',
        oneLiner: 'New Boulder tech incubator opens',
        isBoulder: true,
      };
      
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify(mockResponse),
          },
        }],
      });
      
      const result = await aiExtractor.extractUpdate(mockPageData);
      
      expect(result.oneLiner).toBe('New Boulder tech incubator opens');
      expect(result.summary).toContain('Boulder launches');
      expect(result.isBoulder).toBe(true);
      expect(result.sourceWebsite).toBe('https://example.com/news/update');
    });
  });
  
  describe('extractContent', () => {
    test('should extract content with insights and summary', async () => {
      const mockPageData = {
        url: 'https://example.com/article',
        title: 'The Future of AI in Boulder',
        description: 'Exploring the growing AI ecosystem',
        text: 'Boulder is becoming a hub for AI innovation...',
        html: '<html>...</html>',
      };
      
      const mockResponse = {
        content: 'Boulder is becoming a hub for AI innovation',
        summary: 'Boulder emerges as a key player in AI development with growing startup ecosystem',
        oneLiner: 'Boulder AI ecosystem growing',
        isBoulder: true,
      };
      
      mockOpenAI.chat.completions.create.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify(mockResponse),
          },
        }],
      });
      
      const result = await aiExtractor.extractContent(mockPageData);
      
      expect(result.oneLiner).toBe('Boulder AI ecosystem growing');
      expect(result.summary).toContain('Boulder emerges');
      expect(result.isBoulder).toBe(true);
      expect(result.sourceWebsite).toBe('https://example.com/article');
    });
  });
});