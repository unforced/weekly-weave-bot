import { EventData, UpdateData, ContentData } from './storage.interface.js';

export type ScrapedData = EventData | UpdateData | ContentData;

export interface ScraperInterface {
  scrapeEvent(url: string): Promise<EventData>;
  scrapeUpdate(url: string): Promise<UpdateData>;
  scrapeContent(url: string): Promise<ContentData>;
}