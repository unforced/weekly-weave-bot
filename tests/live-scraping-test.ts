#!/usr/bin/env tsx
/**
 * Live scraping test script for testing real event URLs
 * Usage: tsx tests/live-scraping-test.ts <url>
 */

import { IntelligentScraper } from '../src/scrapers/intelligent-scraper.js';
import { logger } from '../src/utils/logger.js';

async function testEventScraping(url: string) {
  const scraper = new IntelligentScraper();
  
  console.log(`\n🔍 Testing event scraping for: ${url}\n`);
  
  try {
    const startTime = Date.now();
    const event = await scraper.scrapeEvent(url);
    const duration = Date.now() - startTime;
    
    console.log('✅ Scraping successful!\n');
    console.log('📊 Results:');
    console.log('─'.repeat(50));
    console.log(`Title: ${event.title}`);
    console.log(`Start: ${event.startDatetime.toLocaleString()}`);
    console.log(`End: ${event.endDatetime?.toLocaleString() || 'N/A'}`);
    console.log(`Venue: ${event.venueName || 'N/A'}`);
    console.log(`Location: ${event.locationAddress || 'N/A'}`);
    console.log(`Cost: ${event.eventCost || 'N/A'}`);
    console.log(`Boulder Event: ${event.isBoulder ? 'Yes' : 'No'}`);
    console.log(`Tags: ${event.tags?.join(', ') || 'N/A'}`);
    console.log(`Organizer: ${event.organizerName || 'N/A'}`);
    console.log('─'.repeat(50));
    console.log(`\n⏱️  Scraping took ${duration}ms`);
    
    if (event.description) {
      console.log(`\n📝 Description Preview (first 200 chars):`);
      console.log(event.description.slice(0, 200) + '...');
    }
  } catch (error) {
    console.error('❌ Scraping failed:', error);
  }
}

async function testUpdateScraping(url: string) {
  const scraper = new IntelligentScraper();
  
  console.log(`\n🔍 Testing update scraping for: ${url}\n`);
  
  try {
    const update = await scraper.scrapeUpdate(url);
    
    console.log('✅ Scraping successful!\n');
    console.log('📊 Results:');
    console.log('─'.repeat(50));
    console.log(`One-liner: ${update.oneLiner}`);
    console.log(`Boulder Update: ${update.isBoulder ? 'Yes' : 'No'}`);
    console.log('─'.repeat(50));
    console.log(`\n📝 Summary:`);
    console.log(update.summary);
  } catch (error) {
    console.error('❌ Scraping failed:', error);
  }
}

// Sample test URLs for different platforms
const sampleUrls = {
  luma: [
    'https://lu.ma/boulder-startup-week-2024',
    'https://lu.ma/ai-meetup-boulder',
  ],
  eventbrite: [
    'https://www.eventbrite.com/e/boulder-farmers-market-tickets-123456789',
    'https://www.eventbrite.com/e/tech-talk-tuesday-tickets-987654321',
  ],
  meetup: [
    'https://www.meetup.com/boulder-tech/events/291234567/',
    'https://www.meetup.com/boulder-hiking/events/298765432/',
  ],
};

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: tsx tests/live-scraping-test.ts <url> [type]');
    console.log('       tsx tests/live-scraping-test.ts --examples');
    console.log('\nTypes: event (default), update, content');
    console.log('\nExamples:');
    console.log('  tsx tests/live-scraping-test.ts https://lu.ma/some-event');
    console.log('  tsx tests/live-scraping-test.ts https://example.com/news update');
    return;
  }
  
  if (args[0] === '--examples') {
    console.log('\n📌 Testing sample URLs from different platforms...\n');
    
    for (const [platform, urls] of Object.entries(sampleUrls)) {
      console.log(`\n🏷️  ${platform.toUpperCase()} Events:`);
      console.log('═'.repeat(50));
      
      for (const url of urls) {
        await testEventScraping(url);
        console.log('\n');
      }
    }
    return;
  }
  
  const url = args[0];
  const type = args[1] || 'event';
  
  switch (type) {
    case 'event':
      await testEventScraping(url);
      break;
    case 'update':
      await testUpdateScraping(url);
      break;
    default:
      console.error('Unknown type. Use: event, update, or content');
  }
}

main().catch(console.error);