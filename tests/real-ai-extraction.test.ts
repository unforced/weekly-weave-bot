import { IntelligentScraper } from '../src/scrapers/intelligent-scraper.js';
import { WebScraper } from '../src/scrapers/web-scraper.js';
import { AIExtractor } from '../src/scrapers/ai-extractor.js';
import dotenv from 'dotenv';
import { EventData, UpdateData, ContentData } from '../src/interfaces/storage.interface.js';

// Load real API key if available
const envFile = process.env.USE_REAL_AI ? '.env.test.real' : '.env.test';
dotenv.config({ path: envFile });

// Check if we have a real OpenAI key
const hasRealOpenAI = process.env.OPENAI_API_KEY && 
                     process.env.OPENAI_API_KEY.startsWith('sk-') &&
                     process.env.OPENAI_API_KEY.length > 20;

describe('Real AI Extraction Tests', () => {
  if (!hasRealOpenAI) {
    console.log('\n⚠️  WARNING: Running with MOCK AI extraction (no real OpenAI key detected)');
    console.log('To run with real AI, use: USE_REAL_AI=1 npm test tests/real-ai-extraction.test.ts\n');
    
    test.skip('Skipping real AI tests - no OpenAI key available', () => {});
    return;
  }

  console.log('\n✅ Running with REAL OpenAI API\n');

  let scraper: IntelligentScraper;
  
  beforeAll(() => {
    scraper = new IntelligentScraper();
  });
  
  describe('Live Website Scraping with Manual Verification', () => {
    function printEventDetails(event: EventData) {
      console.log('\n🎯 EXTRACTED EVENT DATA:');
      console.log('━'.repeat(60));
      console.log(`📌 Title: ${event.title}`);
      console.log(`📅 Start: ${event.startDatetime.toLocaleString()}`);
      console.log(`📅 End: ${event.endDatetime?.toLocaleString() || 'Not specified'}`);
      console.log(`📍 Venue: ${event.venueName || 'Not specified'}`);
      console.log(`📍 Address: ${event.locationAddress || 'Not specified'}`);
      console.log(`💵 Cost: ${event.eventCost || 'Not specified'}`);
      console.log(`🏔️  Boulder Event: ${event.isBoulder ? 'Yes' : 'No'}`);
      console.log(`🏷️  Tags: ${event.tags?.join(', ') || 'None'}`);
      console.log(`👤 Organizer: ${event.organizerName || 'Not specified'}`);
      console.log(`🔗 Source: ${event.sourceWebsite}`);
      if (event.description) {
        console.log(`\n📝 Description (first 200 chars):`);
        console.log(event.description.slice(0, 200) + '...');
      }
      console.log('━'.repeat(60) + '\n');
    }
    
    function printUpdateDetails(update: UpdateData) {
      console.log('\n📰 EXTRACTED UPDATE DATA:');
      console.log('━'.repeat(60));
      console.log(`📌 One-liner: ${update.oneLiner}`);
      console.log(`🏔️  Boulder Update: ${update.isBoulder ? 'Yes' : 'No'}`);
      console.log(`🔗 Source: ${update.sourceWebsite}`);
      console.log(`\n📝 Summary:`);
      console.log(update.summary);
      console.log('━'.repeat(60) + '\n');
    }
    
    function printContentDetails(content: ContentData) {
      console.log('\n📄 EXTRACTED CONTENT DATA:');
      console.log('━'.repeat(60));
      console.log(`📌 One-liner: ${content.oneLiner}`);
      console.log(`🏔️  Boulder Content: ${content.isBoulder ? 'Yes' : 'No'}`);
      console.log(`🔗 Source: ${content.sourceWebsite}`);
      console.log(`\n📝 Summary:`);
      console.log(content.summary);
      console.log('━'.repeat(60) + '\n');
    }
    
    test('should extract data from example.com (baseline test)', async () => {
      console.log('\n🧪 Testing basic extraction on example.com...');
      
      const event = await scraper.scrapeEvent('https://example.com');
      printEventDetails(event);
      
      expect(event).toBeDefined();
      expect(event.title).toBeTruthy();
      expect(event.startDatetime).toBeInstanceOf(Date);
    }, 30000);
    
    // NOTE: For dynamic testing of fresh events from platform homepages, use:
    // npm test tests/dynamic-event-scraping.test.ts
    test.skip('should extract from a real Luma event', async () => {
      // Skip by default - enable by removing .skip and updating URL
      const lumaUrl = 'https://lu.ma/align-ai-boulder-0206';
      console.log(`\n🧪 Testing Luma event extraction: ${lumaUrl}`);
      
      const event = await scraper.scrapeEvent(lumaUrl);
      printEventDetails(event);
      
      expect(event).toBeDefined();
      expect(event.title).toBeTruthy();
      expect(event.startDatetime).toBeInstanceOf(Date);
      expect(event.venueName).toBeTruthy();
    }, 30000);
    
    test.skip('should extract from a real Eventbrite event', async () => {
      // Replace with a real Eventbrite URL
      const eventbriteUrl = 'https://www.eventbrite.com/e/example-event-tickets-123456789';
      console.log(`\n🧪 Testing Eventbrite event extraction: ${eventbriteUrl}`);
      
      const event = await scraper.scrapeEvent(eventbriteUrl);
      printEventDetails(event);
      
      expect(event).toBeDefined();
      expect(event.title).toBeTruthy();
      expect(event.startDatetime).toBeInstanceOf(Date);
    }, 30000);
    
    test('should extract update from a news article', async () => {
      console.log('\n🧪 Testing update extraction from TechCrunch...');
      
      const update = await scraper.scrapeUpdate('https://techcrunch.com');
      printUpdateDetails(update);
      
      expect(update).toBeDefined();
      expect(update.oneLiner).toBeTruthy();
      expect(update.oneLiner.length).toBeLessThanOrEqual(100);
      expect(update.summary).toBeTruthy();
    }, 30000);
    
    test('should extract content from a blog post', async () => {
      console.log('\n🧪 Testing content extraction from a blog...');
      
      const content = await scraper.scrapeContent('https://blog.samaltman.com');
      printContentDetails(content);
      
      expect(content).toBeDefined();
      expect(content.oneLiner).toBeTruthy();
      expect(content.summary).toBeTruthy();
    }, 30000);
  });
  
  describe('Boulder-specific Detection', () => {
    test('should correctly identify Boulder content', async () => {
      console.log('\n🧪 Testing Boulder detection...');
      
      // Test with a known Boulder-related site
      const boulderUrl = 'https://bouldercolorado.gov';
      const update = await scraper.scrapeUpdate(boulderUrl);
      
      console.log('\n📰 Boulder Detection Test Results:');
      console.log('━'.repeat(60));
      console.log(`📌 One-liner: ${update.oneLiner}`);
      console.log(`🏔️  Boulder: ${update.isBoulder ? 'Yes ✅' : 'No ❌'}`);
      console.log(`🔗 Source: ${update.sourceWebsite}`);
      console.log(`\n📝 Summary:`);
      console.log(update.summary);
      console.log('━'.repeat(60));
      
      console.log(`\n🏔️  Boulder Detection Result: ${update.isBoulder ? 'CORRECTLY IDENTIFIED as Boulder content' : 'FAILED to identify as Boulder content'}`);
      
      expect(update.isBoulder).toBe(true);
    }, 30000);
  });
});