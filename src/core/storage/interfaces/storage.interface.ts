/**
 * Core storage interfaces that work across different providers
 */

export interface StorageProvider {
  name: string;
  
  initialize(): Promise<void>;
  setup?(): Promise<SetupResult>;
  
  // CRUD operations
  create(collection: string, data: any): Promise<StorageResult>;
  read(collection: string, id: string): Promise<any>;
  update(collection: string, id: string, data: any): Promise<StorageResult>;
  delete(collection: string, id: string): Promise<boolean>;
  
  // Query operations
  find(collection: string, query: Query): Promise<any[]>;
  count(collection: string, query?: Query): Promise<number>;
  
  // Batch operations
  createMany(collection: string, data: any[]): Promise<StorageResult[]>;
  updateMany(collection: string, query: Query, data: any): Promise<number>;
  deleteMany(collection: string, query: Query): Promise<number>;
}

export interface StorageResult {
  id: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface SetupResult {
  success: boolean;
  message: string;
  collections?: string[];
  error?: string;
}

export interface Query {
  filters?: FilterGroup;
  sort?: SortOption[];
  limit?: number;
  offset?: number;
  include?: string[];
}

export interface FilterGroup {
  operator: 'and' | 'or';
  conditions: (Filter | FilterGroup)[];
}

export interface Filter {
  field: string;
  operator: FilterOperator;
  value: any;
}

export type FilterOperator = 
  | 'eq' | 'neq' 
  | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'nin'
  | 'contains' | 'startsWith' | 'endsWith'
  | 'exists' | 'notExists';

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface CollectionSchema {
  name: string;
  fields: FieldSchema[];
  indexes?: IndexSchema[];
}

export interface FieldSchema {
  name: string;
  type: FieldType;
  required?: boolean;
  unique?: boolean;
  default?: any;
  validation?: any;
}

export type FieldType = 
  | 'string' | 'number' | 'boolean' | 'date' 
  | 'array' | 'object' | 'reference';

export interface IndexSchema {
  fields: string[];
  unique?: boolean;
  name?: string;
}

export interface StorageConfig {
  provider: string;
  credentials: Record<string, any>;
  schemas?: CollectionSchema[];
  options?: Record<string, any>;
}