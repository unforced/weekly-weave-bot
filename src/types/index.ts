export type CommandType = 'event' | 'update' | 'content';

export interface ProcessingResult {
  success: boolean;
  data?: any;
  error?: string;
  recordId?: string;
  recordUrl?: string;
}

export interface WebPageData {
  url: string;
  title?: string;
  description?: string;
  html: string;
  text: string;
  structuredData?: Record<string, any>;
}