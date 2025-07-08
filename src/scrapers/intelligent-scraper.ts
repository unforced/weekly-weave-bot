import { ScraperInterface } from '../interfaces/scraper.interface.js';
import { EventData, UpdateData, ContentData } from '../interfaces/storage.interface.js';
import { WebScraper } from './web-scraper.js';
import { AIExtractor } from './ai-extractor.js';
import { logger } from '../utils/logger.js';

export class IntelligentScraper implements ScraperInterface {
  private webScraper: WebScraper;
  private aiExtractor: AIExtractor;
  
  constructor() {
    this.webScraper = new WebScraper();
    this.aiExtractor = new AIExtractor();
  }
  
  async scrapeEvent(url: string): Promise<EventData> {
    logger.info(`Scraping event from: ${url}`);
    
    const pageData = await this.webScraper.fetchPage(url);
    const eventData = await this.aiExtractor.extractEvent(pageData);
    
    logger.info(`Successfully extracted event: ${eventData.title}`);
    return eventData;
  }
  
  async scrapeUpdate(url: string): Promise<UpdateData> {
    logger.info(`Scraping update from: ${url}`);
    
    const pageData = await this.webScraper.fetchPage(url);
    const updateData = await this.aiExtractor.extractUpdate(pageData);
    
    logger.info(`Successfully extracted update: ${updateData.oneLiner}`);
    return updateData;
  }
  
  async scrapeContent(url: string): Promise<ContentData> {
    logger.info(`Scraping content from: ${url}`);
    
    const pageData = await this.webScraper.fetchPage(url);
    const contentData = await this.aiExtractor.extractContent(pageData);
    
    logger.info(`Successfully extracted content: ${contentData.oneLiner}`);
    return contentData;
  }
}