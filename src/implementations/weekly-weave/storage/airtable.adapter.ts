import Airtable, { Base, Table } from 'airtable';
import { 
  StorageProvider, 
  StorageResult, 
  SetupResult,
  Query,
  Filter,
  FilterGroup
} from '../../../core/storage/interfaces/storage.interface.js';
import { AIRTABLE_FIELD_MAPPINGS } from '../../../config/airtable-fields.js';

export interface AirtableConfig {
  apiKey: string;
  baseId: string;
  tables: Record<string, string>;
}

export class AirtableStorageAdapter implements StorageProvider {
  name = 'airtable';
  private base: Base;
  private tables: Map<string, Table<any>> = new Map();
  
  constructor(private config: AirtableConfig) {
    Airtable.configure({ apiKey: config.apiKey });
    this.base = Airtable.base(config.baseId);
    
    // Initialize tables
    for (const [key, tableName] of Object.entries(config.tables)) {
      this.tables.set(key, this.base(tableName));
    }
  }
  
  async initialize(): Promise<void> {
    // Test connection by trying to fetch from first table
    const firstTable = Array.from(this.tables.values())[0];
    if (firstTable) {
      try {
        await firstTable.select({ maxRecords: 1 }).firstPage();
      } catch (error) {
        throw new Error('Failed to connect to Airtable');
      }
    }
  }
  
  async setup(): Promise<SetupResult> {
    // Airtable doesn't support programmatic table creation
    // This would guide users to set up their base
    return {
      success: true,
      message: 'Please ensure your Airtable base has the required tables',
      collections: Array.from(this.tables.keys())
    };
  }
  
  async create(collection: string, data: any): Promise<StorageResult> {
    try {
      const table = this.tables.get(collection);
      if (!table) {
        throw new Error(`Collection ${collection} not found`);
      }
      
      // Map data to Airtable fields
      const fields = this.mapToAirtableFields(collection, data);
      const record = await table.create(fields);
      
      return {
        id: (record as any).id || '',
        success: true,
        metadata: { airtableId: (record as any).id }
      };
    } catch (error) {
      return {
        id: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  async read(collection: string, id: string): Promise<any> {
    const table = this.tables.get(collection);
    if (!table) {
      throw new Error(`Collection ${collection} not found`);
    }
    
    const record = await table.find(id);
    return this.mapFromAirtableFields(collection, record.fields);
  }
  
  async update(collection: string, id: string, data: any): Promise<StorageResult> {
    try {
      const table = this.tables.get(collection);
      if (!table) {
        throw new Error(`Collection ${collection} not found`);
      }
      
      const fields = this.mapToAirtableFields(collection, data);
      await table.update(id, fields);
      
      return { id, success: true };
    } catch (error) {
      return {
        id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  async delete(collection: string, id: string): Promise<boolean> {
    try {
      const table = this.tables.get(collection);
      if (!table) {
        throw new Error(`Collection ${collection} not found`);
      }
      
      await table.destroy(id);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  async find(collection: string, query: Query): Promise<any[]> {
    const table = this.tables.get(collection);
    if (!table) {
      throw new Error(`Collection ${collection} not found`);
    }
    
    const formula = this.buildAirtableFormula(collection, query.filters);
    const sort = this.buildAirtableSort(collection, query.sort);
    
    const records = await table.select({
      filterByFormula: formula,
      sort,
      maxRecords: query.limit,
      pageSize: query.limit || 100
    }).all();
    
    return records.map(record => this.mapFromAirtableFields(collection, record.fields));
  }
  
  async count(collection: string, query?: Query): Promise<number> {
    const results = await this.find(collection, query || {});
    return results.length;
  }
  
  async createMany(collection: string, data: any[]): Promise<StorageResult[]> {
    const results: StorageResult[] = [];
    
    // Airtable supports batch create of up to 10 records
    const chunks = this.chunk(data, 10);
    for (const chunk of chunks) {
      const promises = chunk.map(item => this.create(collection, item));
      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults);
    }
    
    return results;
  }
  
  async updateMany(collection: string, query: Query, data: any): Promise<number> {
    const records = await this.find(collection, query);
    const updates = records.map(record => this.update(collection, record.id, data));
    const results = await Promise.all(updates);
    return results.filter(r => r.success).length;
  }
  
  async deleteMany(collection: string, query: Query): Promise<number> {
    const records = await this.find(collection, query);
    const deletes = records.map(record => this.delete(collection, record.id));
    const results = await Promise.all(deletes);
    return results.filter(r => r).length;
  }
  
  private mapToAirtableFields(collection: string, data: any): any {
    const mapping = (AIRTABLE_FIELD_MAPPINGS as any)[collection];
    if (!mapping) return data;
    
    const fields: any = {};
    for (const [key, value] of Object.entries(data)) {
      const fieldName = mapping[key] || key;
      fields[fieldName] = value;
    }
    
    return fields;
  }
  
  private mapFromAirtableFields(collection: string, fields: any): any {
    const mapping = (AIRTABLE_FIELD_MAPPINGS as any)[collection];
    if (!mapping) return fields;
    
    const data: any = {};
    const reverseMapping = Object.fromEntries(
      Object.entries(mapping).map(([k, v]) => [v, k])
    );
    
    for (const [fieldName, value] of Object.entries(fields)) {
      const key = reverseMapping[fieldName] || fieldName;
      data[key] = value;
    }
    
    return data;
  }
  
  private buildAirtableFormula(collection: string, filters?: FilterGroup): string {
    if (!filters) return '';
    
    const conditions = filters.conditions.map(condition => {
      if ('operator' in condition && condition.operator) {
        // It's a nested FilterGroup
        return `(${this.buildAirtableFormula(collection, condition as FilterGroup)})`;
      } else {
        // It's a Filter
        const filter = condition as Filter;
        const fieldName = this.getAirtableFieldName(collection, filter.field);
        return this.buildFilterCondition(fieldName, filter);
      }
    });
    
    const operator = filters.operator === 'or' ? 'OR' : 'AND';
    return conditions.length > 0 ? `${operator}(${conditions.join(', ')})` : '';
  }
  
  private buildFilterCondition(field: string, filter: Filter): string {
    switch (filter.operator) {
      case 'eq':
        return `{${field}} = '${filter.value}'`;
      case 'neq':
        return `{${field}} != '${filter.value}'`;
      case 'gt':
        return `{${field}} > '${filter.value}'`;
      case 'gte':
        return `{${field}} >= '${filter.value}'`;
      case 'lt':
        return `{${field}} < '${filter.value}'`;
      case 'lte':
        return `{${field}} <= '${filter.value}'`;
      case 'contains':
        return `FIND('${filter.value}', {${field}})`;
      case 'startsWith':
        return `LEFT({${field}}, ${filter.value.length}) = '${filter.value}'`;
      default:
        return '';
    }
  }
  
  private buildAirtableSort(collection: string, sort?: any[]): any[] {
    if (!sort) return [];
    
    return sort.map(s => ({
      field: this.getAirtableFieldName(collection, s.field),
      direction: s.direction
    }));
  }
  
  private getAirtableFieldName(collection: string, field: string): string {
    const mapping = (AIRTABLE_FIELD_MAPPINGS as any)[collection];
    return mapping?.[field] || field;
  }
  
  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}