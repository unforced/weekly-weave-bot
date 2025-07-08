import { IntelligentScraper } from '../src/scrapers/intelligent-scraper.js';
import { WebScraper } from '../src/scrapers/web-scraper.js';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';

// Load real API key if available
const envFile = process.env.USE_REAL_AI ? '.env.test.real' : '.env.test';
dotenv.config({ path: envFile });

const hasRealOpenAI = process.env.OPENAI_API_KEY && 
                     process.env.OPENAI_API_KEY.startsWith('sk-') &&
                     process.env.OPENAI_API_KEY.length > 20;

describe('Dynamic Event Scraping Tests', () => {
  if (!hasRealOpenAI) {
    console.log('\n⚠️  Skipping dynamic event tests - no real OpenAI key detected');
    test.skip('Requires real OpenAI API', () => {});
    return;
  }

  let scraper: IntelligentScraper;
  let webScraper: WebScraper;
  
  beforeAll(() => {
    scraper = new IntelligentScraper();
    webScraper = new WebScraper();
  });
  
  describe('Platform Homepage Scraping', () => {
    test('should find and extract events from Luma homepage', async () => {
      console.log('\n🔍 Searching for events on Luma...');
      
      try {
        // First, scrape the Luma events page to find real event URLs
        const lumaPage = await webScraper.fetchPage('https://lu.ma/denver');
        const $ = cheerio.load(lumaPage.html);
        
        // Look for event links on the page
        const eventLinks: string[] = [];
        $('a[href*="lu.ma/"]').each((_, element) => {
          const href = $(element).attr('href');
          if (href && href.includes('lu.ma/') && !href.includes('/denver') && !href.includes('/discover')) {
            const fullUrl = href.startsWith('http') ? href : `https://lu.ma${href}`;
            if (!eventLinks.includes(fullUrl)) {
              eventLinks.push(fullUrl);
            }
          }
        });
        
        console.log(`Found ${eventLinks.length} potential event links on Luma`);
        
        if (eventLinks.length > 0) {
          // Test the first event found
          const eventUrl = eventLinks[0];
          console.log(`\n📌 Testing event: ${eventUrl}`);
          
          const event = await scraper.scrapeEvent(eventUrl);
          
          console.log('\n✅ Successfully extracted Luma event:');
          console.log(`   Title: ${event.title}`);
          console.log(`   Date: ${event.startDatetime.toLocaleString()}`);
          console.log(`   Venue: ${event.venueName || 'Not specified'}`);
          console.log(`   Denver/Boulder: ${event.isBoulder ? 'Yes' : 'No'}`);
          
          expect(event.title).toBeTruthy();
          expect(event.startDatetime).toBeInstanceOf(Date);
        } else {
          console.log('⚠️  No events found on Luma Denver page');
        }
      } catch (error) {
        console.log(`❌ Error scraping Luma: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }, 60000); // 60 second timeout
    
    test('should find and extract events from Eventbrite', async () => {
      console.log('\n🔍 Searching for events on Eventbrite...');
      
      try {
        // Scrape Eventbrite Boulder events page
        const eventbritePage = await webScraper.fetchPage('https://www.eventbrite.com/d/co--boulder/events/');
        const $ = cheerio.load(eventbritePage.html);
        
        // Look for event links
        const eventLinks: string[] = [];
        $('a[href*="/e/"]').each((_, element) => {
          const href = $(element).attr('href');
          if (href && href.includes('/e/') && href.includes('eventbrite.com')) {
            const fullUrl = href.startsWith('http') ? href : `https://www.eventbrite.com${href}`;
            // Remove query parameters
            const cleanUrl = fullUrl.split('?')[0];
            if (!eventLinks.includes(cleanUrl)) {
              eventLinks.push(cleanUrl);
            }
          }
        });
        
        console.log(`Found ${eventLinks.length} potential event links on Eventbrite`);
        
        if (eventLinks.length > 0) {
          // Test the first event found
          const eventUrl = eventLinks[0];
          console.log(`\n📌 Testing event: ${eventUrl}`);
          
          const event = await scraper.scrapeEvent(eventUrl);
          
          console.log('\n✅ Successfully extracted Eventbrite event:');
          console.log(`   Title: ${event.title}`);
          console.log(`   Date: ${event.startDatetime.toLocaleString()}`);
          console.log(`   Venue: ${event.venueName || 'Not specified'}`);
          console.log(`   Cost: ${event.eventCost || 'Not specified'}`);
          console.log(`   Denver/Boulder: ${event.isBoulder ? 'Yes' : 'No'}`);
          
          expect(event.title).toBeTruthy();
          expect(event.startDatetime).toBeInstanceOf(Date);
        } else {
          console.log('⚠️  No events found on Eventbrite Boulder page');
        }
      } catch (error) {
        console.log(`❌ Error scraping Eventbrite: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }, 60000);
    
    test('should find and extract events from Meetup', async () => {
      console.log('\n🔍 Searching for events on Meetup...');
      
      try {
        // Scrape Meetup Boulder events
        const meetupPage = await webScraper.fetchPage('https://www.meetup.com/find/?location=us--co--boulder&source=EVENTS');
        const $ = cheerio.load(meetupPage.html);
        
        // Look for event links
        const eventLinks: string[] = [];
        $('a[href*="/events/"]').each((_, element) => {
          const href = $(element).attr('href');
          if (href && href.includes('/events/') && href.includes('meetup.com')) {
            const fullUrl = href.startsWith('http') ? href : `https://www.meetup.com${href}`;
            if (!eventLinks.includes(fullUrl)) {
              eventLinks.push(fullUrl);
            }
          }
        });
        
        console.log(`Found ${eventLinks.length} potential event links on Meetup`);
        
        if (eventLinks.length > 0) {
          // Test the first event found
          const eventUrl = eventLinks[0];
          console.log(`\n📌 Testing event: ${eventUrl}`);
          
          const event = await scraper.scrapeEvent(eventUrl);
          
          console.log('\n✅ Successfully extracted Meetup event:');
          console.log(`   Title: ${event.title}`);
          console.log(`   Date: ${event.startDatetime.toLocaleString()}`);
          console.log(`   Venue: ${event.venueName || 'Not specified'}`);
          console.log(`   Denver/Boulder: ${event.isBoulder ? 'Yes' : 'No'}`);
          
          expect(event.title).toBeTruthy();
          expect(event.startDatetime).toBeInstanceOf(Date);
        } else {
          console.log('⚠️  No events found on Meetup Boulder page');
        }
      } catch (error) {
        console.log(`❌ Error scraping Meetup: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }, 60000);
  });
  
  describe('Event Quality Validation', () => {
    test('should extract consistent data across platforms', async () => {
      console.log('\n🔍 Testing data quality across platforms...');
      
      const platforms = [
        { name: 'Luma', url: 'https://lu.ma/denver', selector: 'a[href*="lu.ma/"]' },
        { name: 'Eventbrite', url: 'https://www.eventbrite.com/d/co--boulder/events/', selector: 'a[href*="/e/"]' },
      ];
      
      for (const platform of platforms) {
        try {
          const page = await webScraper.fetchPage(platform.url);
          const $ = cheerio.load(page.html);
          
          const firstLink = $(platform.selector).first().attr('href');
          if (firstLink) {
            const fullUrl = firstLink.startsWith('http') ? firstLink : `https://${platform.name.toLowerCase()}.com${firstLink}`;
            console.log(`\n📌 ${platform.name}: ${fullUrl}`);
            
            const event = await scraper.scrapeEvent(fullUrl);
            
            // Validate required fields
            expect(event.title).toBeTruthy();
            expect(event.title.length).toBeGreaterThan(3);
            expect(event.startDatetime).toBeInstanceOf(Date);
            expect(event.startDatetime.getTime()).toBeGreaterThan(Date.now() - 86400000); // Not in the past
            expect(typeof event.isBoulder).toBe('boolean');
            
            console.log(`   ✅ Valid event data extracted`);
          }
        } catch (error) {
          console.log(`   ⚠️  ${platform.name}: ${error instanceof Error ? error.message : 'Unknown'}`);
        }
      }
    }, 90000);
  });
});