import Airtable, { Base, Table } from 'airtable';
import { StorageInterface, EventData, UpdateData, ContentData, ErrorLog } from '../interfaces/storage.interface.js';
import { loadConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { AIRTABLE_FIELD_MAPPINGS as FIELDS } from '../config/airtable-fields.js';

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
        [FIELDS.events.title]: data.title,
        [FIELDS.events.description]: data.description,
        [FIELDS.events.venueName]: data.venueName,
        [FIELDS.events.locationAddress]: data.locationAddress,
        [FIELDS.events.startDatetime]: data.startDatetime.toISOString(),
        [FIELDS.events.endDatetime]: data.endDatetime?.toISOString(),
        [FIELDS.events.eventCost]: data.eventCost,
        [FIELDS.events.tags]: data.tags?.join(', '),
        [FIELDS.events.sourceWebsite]: data.sourceWebsite,
        [FIELDS.events.organizerName]: data.organizerName,
        [FIELDS.events.organizerContact]: data.organizerContact,
        [FIELDS.events.isBoulder]: data.isBoulder,
        [FIELDS.events.category]: data.category,
        [FIELDS.events.isRecurring]: data.isRecurring,
        [FIELDS.events.registrationLink]: data.registrationLink || data.sourceWebsite,
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
        [FIELDS.updates.content]: data.content,
        [FIELDS.updates.summary]: data.summary,
        [FIELDS.updates.oneLiner]: data.oneLiner,
        [FIELDS.updates.isBoulder]: data.isBoulder,
        [FIELDS.updates.sourceWebsite]: data.sourceWebsite,
        [FIELDS.updates.createdAt]: new Date().toISOString(),
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
        [FIELDS.content.content]: data.content,
        [FIELDS.content.summary]: data.summary,
        [FIELDS.content.oneLiner]: data.oneLiner,
        [FIELDS.content.isBoulder]: data.isBoulder,
        [FIELDS.content.sourceWebsite]: data.sourceWebsite,
        [FIELDS.content.createdAt]: new Date().toISOString(),
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
        [FIELDS.errors.timestamp]: error.timestamp.toISOString(),
        [FIELDS.errors.command]: error.command,
        [FIELDS.errors.url]: error.url,
        [FIELDS.errors.error]: error.error,
        [FIELDS.errors.userId]: error.userId,
        [FIELDS.errors.details]: error.details,
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
        title: record.get(FIELDS.events.title),
        description: record.get(FIELDS.events.description),
        venueName: record.get(FIELDS.events.venueName),
        locationAddress: record.get(FIELDS.events.locationAddress),
        startDatetime: new Date(record.get(FIELDS.events.startDatetime)),
        endDatetime: record.get(FIELDS.events.endDatetime) ? new Date(record.get(FIELDS.events.endDatetime)) : undefined,
        eventCost: record.get(FIELDS.events.eventCost),
        tags: record.get(FIELDS.events.tags)?.split(', '),
        sourceWebsite: record.get(FIELDS.events.sourceWebsite),
        organizerName: record.get(FIELDS.events.organizerName),
        organizerContact: record.get(FIELDS.events.organizerContact),
        isBoulder: record.get(FIELDS.events.isBoulder),
        category: record.get(FIELDS.events.category),
        isRecurring: record.get(FIELDS.events.isRecurring),
        registrationLink: record.get(FIELDS.events.registrationLink),
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
          sort: [{ field: FIELDS.system.created, direction: 'desc' }],
        })
        .firstPage();
      
      return records.map(record => ({
        content: record.get(FIELDS.updates.content),
        summary: record.get(FIELDS.updates.summary),
        oneLiner: record.get(FIELDS.updates.oneLiner),
        isBoulder: record.get(FIELDS.updates.isBoulder),
        sourceWebsite: record.get(FIELDS.updates.sourceWebsite),
        createdAt: record.get(FIELDS.updates.createdAt) ? new Date(record.get(FIELDS.updates.createdAt)) : undefined,
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
          sort: [{ field: FIELDS.system.created, direction: 'desc' }],
        })
        .firstPage();
      
      return records.map(record => ({
        content: record.get(FIELDS.content.content),
        summary: record.get(FIELDS.content.summary),
        oneLiner: record.get(FIELDS.content.oneLiner),
        isBoulder: record.get(FIELDS.content.isBoulder),
        sourceWebsite: record.get(FIELDS.content.sourceWebsite),
        createdAt: record.get(FIELDS.content.createdAt) ? new Date(record.get(FIELDS.content.createdAt)) : undefined,
      }));
    } catch (error) {
      logger.error('Error fetching recent content:', error);
      return [];
    }
  }
  
  async getEventsByDateRange(startDate: Date, endDate: Date, locationFilter?: string): Promise<EventData[]> {
    try {
      const filterParts = [
        `AND({${FIELDS.events.startDatetime}} >= '${startDate.toISOString()}',`,
        `{${FIELDS.events.startDatetime}} <= '${endDate.toISOString()}')`
      ];
      
      if (locationFilter) {
        filterParts[1] = `{${FIELDS.events.startDatetime}} <= '${endDate.toISOString()}',`;
        filterParts.push(`{${FIELDS.events.isBoulder}} = TRUE())`);
      }
      
      const filterFormula = filterParts.join('');
      
      const records = await this.eventsTable
        .select({
          filterByFormula: filterFormula,
          sort: [{ field: FIELDS.events.startDatetime, direction: 'asc' }],
        })
        .all();
      
      return records.map(record => ({
        title: record.get(FIELDS.events.title),
        description: record.get(FIELDS.events.description),
        venueName: record.get(FIELDS.events.venueName),
        locationAddress: record.get(FIELDS.events.locationAddress),
        startDatetime: new Date(record.get(FIELDS.events.startDatetime)),
        endDatetime: record.get(FIELDS.events.endDatetime) ? new Date(record.get(FIELDS.events.endDatetime)) : undefined,
        eventCost: record.get(FIELDS.events.eventCost),
        tags: record.get(FIELDS.events.tags)?.split(', '),
        sourceWebsite: record.get(FIELDS.events.sourceWebsite),
        organizerName: record.get(FIELDS.events.organizerName),
        organizerContact: record.get(FIELDS.events.organizerContact),
        isBoulder: record.get(FIELDS.events.isBoulder),
        category: record.get(FIELDS.events.category),
        isRecurring: record.get(FIELDS.events.isRecurring),
        registrationLink: record.get(FIELDS.events.registrationLink),
      }));
    } catch (error) {
      logger.error('Error fetching events by date range:', error);
      return [];
    }
  }
  
  async getUpdatesByDateRange(startDate: Date, endDate: Date): Promise<UpdateData[]> {
    try {
      const filterFormula = `AND({${FIELDS.updates.createdAt}} >= '${startDate.toISOString()}', {${FIELDS.updates.createdAt}} <= '${endDate.toISOString()}')`;
      
      const records = await this.updatesTable
        .select({
          filterByFormula: filterFormula,
          sort: [{ field: FIELDS.updates.createdAt, direction: 'desc' }],
        })
        .all();
      
      return records.map(record => ({
        content: record.get(FIELDS.updates.content),
        summary: record.get(FIELDS.updates.summary),
        oneLiner: record.get(FIELDS.updates.oneLiner),
        isBoulder: record.get(FIELDS.updates.isBoulder),
        sourceWebsite: record.get(FIELDS.updates.sourceWebsite),
        createdAt: record.get(FIELDS.updates.createdAt) ? new Date(record.get(FIELDS.updates.createdAt)) : undefined,
      }));
    } catch (error) {
      logger.error('Error fetching updates by date range:', error);
      return [];
    }
  }
  
  async getContentByDateRange(startDate: Date, endDate: Date): Promise<ContentData[]> {
    try {
      const filterFormula = `AND({${FIELDS.content.createdAt}} >= '${startDate.toISOString()}', {${FIELDS.content.createdAt}} <= '${endDate.toISOString()}')`;
      
      const records = await this.contentTable
        .select({
          filterByFormula: filterFormula,
          sort: [{ field: FIELDS.content.createdAt, direction: 'desc' }],
        })
        .all();
      
      return records.map(record => ({
        content: record.get(FIELDS.content.content),
        summary: record.get(FIELDS.content.summary),
        oneLiner: record.get(FIELDS.content.oneLiner),
        isBoulder: record.get(FIELDS.content.isBoulder),
        sourceWebsite: record.get(FIELDS.content.sourceWebsite),
        createdAt: record.get(FIELDS.content.createdAt) ? new Date(record.get(FIELDS.content.createdAt)) : undefined,
      }));
    } catch (error) {
      logger.error('Error fetching content by date range:', error);
      return [];
    }
  }
}