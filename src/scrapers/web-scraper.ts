import axios from 'axios';
import * as cheerio from 'cheerio';
import { WebPageData } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { extractStructuredData } from './structured-data-extractor.js';

export class WebScraper {
  private readonly userAgent = 'Mozilla/5.0 (compatible; WeeklyWeaveBot/1.0)';
  
  async fetchPage(url: string): Promise<WebPageData> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
        },
        timeout: 10000,
        maxRedirects: 5,
      });
      
      const $ = cheerio.load(response.data);
      
      // Remove script and style tags
      $('script, style').remove();
      
      // Extract metadata - prefer og:title for better quality
      const ogTitle = $('meta[property="og:title"]').attr('content');
      const pageTitle = $('title').text().trim();
      const h1Title = $('h1').first().text().trim();
      
      // Use og:title if available and more descriptive than page title
      const title = (ogTitle && ogTitle.length > 10) ? ogTitle :
                   (pageTitle && pageTitle !== 'App') ? pageTitle : 
                   ogTitle || pageTitle || h1Title;
                   
      const description = $('meta[name="description"]').attr('content') || 
                         $('meta[property="og:description"]').attr('content') || 
                         '';
      
      // Extract text content
      const text = $('body').text()
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 10000); // Limit text to 10k chars
      
      // Extract structured data using separate function
      const structuredData = extractStructuredData(response.data);
      
      return {
        url,
        title,
        description,
        html: response.data,
        text,
        structuredData,
      };
    } catch (error) {
      logger.error('Error fetching page:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Page not found (404)');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out');
        }
      }
      
      throw new Error('Failed to fetch page');
    }
  }
  
  extractStructuredData = ($: cheerio.CheerioAPI): Record<string, any> => {
    let structuredData: Record<string, any> = {};
    
    // Extract JSON-LD structured data
    const scripts = $('script[type="application/ld+json"]');
    
    scripts.each((_, element) => {
      try {
        // Use .text() instead of .html() for more reliable extraction
        const jsonText = $(element).text().trim();
        
        if (jsonText) {
          const data = JSON.parse(jsonText);
          
          // If we have an array, merge all objects
          if (Array.isArray(data)) {
            data.forEach(item => {
              if (item['@type'] === 'Event' || item.startDate) {
                // Prefer event data
                structuredData = { ...structuredData, ...item };
              } else {
                Object.assign(structuredData, item);
              }
            });
          } else {
            // Single object
            if (data['@type'] === 'Event' || data.startDate) {
              // Prefer event data
              structuredData = { ...structuredData, ...data };
            } else {
              Object.assign(structuredData, data);
            }
          }
        }
      } catch (e) {
        // Ignore parsing errors silently
      }
    });
    
    return structuredData;
  }
}