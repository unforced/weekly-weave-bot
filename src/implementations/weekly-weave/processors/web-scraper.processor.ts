import axios from 'axios';
import * as cheerio from 'cheerio';
import { 
  WebProcessor, 
  WebContent, 
  ProcessorResult 
} from '../../../core/processors/interfaces/processor.interface.js';

export class WebScraperProcessor implements WebProcessor {
  name = 'web-scraper';
  description = 'Scrapes and extracts content from web pages';
  rateLimit = 1000; // 1 request per second
  
  constructor(private options?: {
    timeout?: number;
    maxContentLength?: number;
    userAgent?: string;
  }) {}
  
  async process(url: string): Promise<ProcessorResult<WebContent>> {
    try {
      // Fetch the page
      const response = await axios.get(url, {
        timeout: this.options?.timeout || 10000,
        maxContentLength: this.options?.maxContentLength || 10000,
        headers: {
          'User-Agent': this.options?.userAgent || 'Mozilla/5.0 (compatible; WeeklyWeaveBot/1.0)'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // Extract content
      const content: WebContent = {
        title: this.extractTitle($),
        description: this.extractDescription($),
        content: this.extractContent($),
        metadata: this.extractMetadata($),
        structuredData: this.extractStructuredData($),
        links: this.extractLinks($, url),
        images: this.extractImages($, url)
      };
      
      return {
        success: true,
        data: content,
        metadata: {
          url,
          fetchedAt: new Date(),
          statusCode: response.status
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch webpage'
      };
    }
  }
  
  validate(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
  
  private extractTitle($: cheerio.CheerioAPI): string {
    // Priority: og:title > title > h1
    return $('meta[property="og:title"]').attr('content') ||
           $('title').text().trim() ||
           $('h1').first().text().trim() ||
           '';
  }
  
  private extractDescription($: cheerio.CheerioAPI): string {
    return $('meta[property="og:description"]').attr('content') ||
           $('meta[name="description"]').attr('content') ||
           '';
  }
  
  private extractContent($: cheerio.CheerioAPI): string {
    // Remove script and style elements
    $('script, style').remove();
    
    // Try to find main content
    const selectors = ['main', 'article', '[role="main"]', '.content', '#content'];
    
    for (const selector of selectors) {
      const content = $(selector).first().text().trim();
      if (content.length > 100) {
        return content.substring(0, this.options?.maxContentLength || 10000);
      }
    }
    
    // Fallback to body
    return $('body').text().trim().substring(0, this.options?.maxContentLength || 10000);
  }
  
  private extractMetadata($: cheerio.CheerioAPI): Record<string, any> {
    const metadata: Record<string, any> = {};
    
    // Open Graph
    $('meta[property^="og:"]').each((_, el) => {
      const property = $(el).attr('property')?.replace('og:', '');
      const content = $(el).attr('content');
      if (property && content) {
        metadata[property] = content;
      }
    });
    
    // Twitter Card
    $('meta[name^="twitter:"]').each((_, el) => {
      const name = $(el).attr('name')?.replace('twitter:', '');
      const content = $(el).attr('content');
      if (name && content) {
        metadata[`twitter_${name}`] = content;
      }
    });
    
    return metadata;
  }
  
  private extractStructuredData($: cheerio.CheerioAPI): any[] {
    const structuredData: any[] = [];
    
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || '{}');
        structuredData.push(data);
      } catch {
        // Invalid JSON, skip
      }
    });
    
    return structuredData;
  }
  
  private extractLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const links: string[] = [];
    
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        try {
          const absoluteUrl = new URL(href, baseUrl).toString();
          links.push(absoluteUrl);
        } catch {
          // Invalid URL, skip
        }
      }
    });
    
    return [...new Set(links)]; // Remove duplicates
  }
  
  private extractImages($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const images: string[] = [];
    
    $('img[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) {
        try {
          const absoluteUrl = new URL(src, baseUrl).toString();
          images.push(absoluteUrl);
        } catch {
          // Invalid URL, skip
        }
      }
    });
    
    return [...new Set(images)];
  }
}