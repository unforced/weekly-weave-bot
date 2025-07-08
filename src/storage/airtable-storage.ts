import Airtable, { Base, Table } from 'airtable';
import { StorageInterface, EventData, UpdateData, ContentData, ErrorLog } from '../interfaces/storage.interface.js';
import { loadConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';

export class AirtableStorage implements StorageInterface {
  private base: Base;
  private eventsTable: Table<any>;
  private updatesTable: Table<any>;
  private contentTable: Table<any>;
  private errorsTable: Table<any>;
  
  constructor() {
    const config = loadConfig();
    Airtable.configure({
      apiKey: config.AIRTABLE_API_KEY,
    });
    
    this.base = Airtable.base(config.AIRTABLE_BASE_ID);
    this.eventsTable = this.base('Events');
    this.updatesTable = this.base('Updates');
    this.contentTable = this.base('Content');
    this.errorsTable = this.base('Errors');
  }
  
  async initialize(): Promise<void> {
    try {
      // Test connection by listing records
      await this.eventsTable.select({ maxRecords: 1 }).firstPage();
      logger.info('Airtable connection successful');
    } catch (error) {
      logger.error('Failed to connect to Airtable:', error);
      throw new Error('Failed to initialize Airtable storage');
    }
  }
  
  async saveEvent(data: EventData): Promise<{ id: string; url: string }> {
    try {
      const record = await this.eventsTable.create({
        'Title': data.title,
        'Description': data.description,
        'Venue Name': data.venueName,
        'Location Address': data.locationAddress,
        'Start Datetime': data.startDatetime.toISOString(),
        'End Datetime': data.endDatetime?.toISOString(),
        'Event Cost': data.eventCost,
        'Tags': data.tags?.join(', '),
        'Source Website': data.sourceWebsite,
        'Organizer Name': data.organizerName,
        'Organizer Contact': data.organizerContact,
        'Is Boulder': data.isBoulder,
      });
      
      // Generate Airtable URL (this is a simplified version - actual URL structure may vary)
      const config = loadConfig();
      const recordUrl = `https://airtable.com/${config.AIRTABLE_BASE_ID}/tbl_events/${record.id}`;
      
      return {
        id: record.id,
        url: recordUrl,
      };
    } catch (error) {
      logger.error('Error saving event:', error);
      throw new Error('Failed to save event to Airtable');
    }
  }
  
  async saveUpdate(data: UpdateData): Promise<{ id: string; url: string }> {
    try {
      const record = await this.updatesTable.create({
        'Content': data.content,
        'Summary': data.summary,
        'One-liner': data.oneLiner,
        'Is Boulder': data.isBoulder,
        'Source Website': data.sourceWebsite,
      });
      
      // Generate Airtable URL
      const config = loadConfig();
      const recordUrl = `https://airtable.com/${config.AIRTABLE_BASE_ID}/tbl_updates/${record.id}`;
      
      return {
        id: record.id,
        url: recordUrl,
      };
    } catch (error) {
      logger.error('Error saving update:', error);
      throw new Error('Failed to save update to Airtable');
    }
  }
  
  async saveContent(data: ContentData): Promise<{ id: string; url: string }> {
    try {
      const record = await this.contentTable.create({
        'Content': data.content,
        'Summary': data.summary,
        'One-liner': data.oneLiner,
        'Is Boulder': data.isBoulder,
        'Source Website': data.sourceWebsite,
      });
      
      // Generate Airtable URL
      const config = loadConfig();
      const recordUrl = `https://airtable.com/${config.AIRTABLE_BASE_ID}/tbl_content/${record.id}`;
      
      return {
        id: record.id,
        url: recordUrl,
      };
    } catch (error) {
      logger.error('Error saving content:', error);
      throw new Error('Failed to save content to Airtable');
    }
  }
  
  async logError(error: ErrorLog): Promise<void> {
    try {
      await this.errorsTable.create({
        'Timestamp': error.timestamp.toISOString(),
        'Command': error.command,
        'URL': error.url,
        'Error': error.error,
        'User ID': error.userId,
        'Details': error.details,
      });
    } catch (err) {
      logger.error('Error logging to error table:', err);
    }
  }
  
  async getRecentEvents(limit: number = 10): Promise<EventData[]> {
    try {
      const records = await this.eventsTable
        .select({
          maxRecords: limit,
          sort: [{ field: 'Created', direction: 'desc' }],
        })
        .firstPage();
      
      return records.map(record => ({
        title: record.get('Title'),
        description: record.get('Description'),
        venueName: record.get('Venue Name'),
        locationAddress: record.get('Location Address'),
        startDatetime: new Date(record.get('Start Datetime')),
        endDatetime: record.get('End Datetime') ? new Date(record.get('End Datetime')) : undefined,
        eventCost: record.get('Event Cost'),
        tags: record.get('Tags')?.split(', '),
        sourceWebsite: record.get('Source Website'),
        organizerName: record.get('Organizer Name'),
        organizerContact: record.get('Organizer Contact'),
        isBoulder: record.get('Is Boulder'),
      }));
    } catch (error) {
      logger.error('Error fetching recent events:', error);
      return [];
    }
  }
  
  async getRecentUpdates(limit: number = 10): Promise<UpdateData[]> {
    try {
      const records = await this.updatesTable
        .select({
          maxRecords: limit,
          sort: [{ field: 'Created', direction: 'desc' }],
        })
        .firstPage();
      
      return records.map(record => ({
        content: record.get('Content'),
        summary: record.get('Summary'),
        oneLiner: record.get('One-liner'),
        isBoulder: record.get('Is Boulder'),
        sourceWebsite: record.get('Source Website'),
      }));
    } catch (error) {
      logger.error('Error fetching recent updates:', error);
      return [];
    }
  }
  
  async getRecentContent(limit: number = 10): Promise<ContentData[]> {
    try {
      const records = await this.contentTable
        .select({
          maxRecords: limit,
          sort: [{ field: 'Created', direction: 'desc' }],
        })
        .firstPage();
      
      return records.map(record => ({
        content: record.get('Content'),
        summary: record.get('Summary'),
        oneLiner: record.get('One-liner'),
        isBoulder: record.get('Is Boulder'),
        sourceWebsite: record.get('Source Website'),
      }));
    } catch (error) {
      logger.error('Error fetching recent content:', error);
      return [];
    }
  }
}