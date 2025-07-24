export interface EventData {
  title: string;
  description?: string;
  venueName?: string;
  locationAddress?: string;
  startDatetime: Date;
  endDatetime?: Date;
  eventCost?: string;
  tags?: string[];
  sourceWebsite: string;
  organizerName?: string;
  organizerContact?: string;
  isBoulder: boolean;
  category?: 'literary' | 'cultural' | 'music' | 'activist' | 'tech' | 'community' | 'other';
  isRecurring?: boolean;
  registrationLink?: string;
}

export interface UpdateData {
  content: string;
  summary: string;
  oneLiner: string;
  isBoulder: boolean;
  sourceWebsite: string;
  createdAt?: Date;
}

export interface ContentData {
  content: string;
  summary: string;
  oneLiner: string;
  isBoulder: boolean;
  sourceWebsite: string;
  createdAt?: Date;
}

export interface ErrorLog {
  timestamp: Date;
  command: string;
  url: string;
  error: string;
  userId?: string;
  details?: string;
}

export interface StorageInterface {
  initialize(): Promise<void>;
  
  saveEvent(data: EventData): Promise<{ id: string; url: string }>;
  saveUpdate(data: UpdateData): Promise<{ id: string; url: string }>;
  saveContent(data: ContentData): Promise<{ id: string; url: string }>;
  
  logError(error: ErrorLog): Promise<void>;
  
  getRecentEvents(limit?: number): Promise<EventData[]>;
  getRecentUpdates(limit?: number): Promise<UpdateData[]>;
  getRecentContent(limit?: number): Promise<ContentData[]>;
  
  getEventsByDateRange(startDate: Date, endDate: Date, locationFilter?: string): Promise<EventData[]>;
  getUpdatesByDateRange(startDate: Date, endDate: Date): Promise<UpdateData[]>;
  getContentByDateRange(startDate: Date, endDate: Date): Promise<ContentData[]>;
}