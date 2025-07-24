export interface NewsletterOptions {
  startDate: Date;
  endDate: Date;
  includeEvents?: boolean;
  includeUpdates?: boolean;
  includeContent?: boolean;
  groupBy?: 'date' | 'category' | 'location';
  template?: string;
  locationFilter?: string;
  title?: string;
  introduction?: string;
  conclusion?: string;
}

export interface NewsletterData {
  title: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  events: EventItem[];
  updates: UpdateItem[];
  content: ContentItem[];
  metadata?: Record<string, any>;
}

export interface EventItem {
  id?: string;
  title: string;
  description?: string;
  venueName?: string;
  locationAddress?: string;
  startDatetime: Date;
  endDatetime?: Date;
  eventCost?: string;
  tags?: string[];
  sourceWebsite: string;
  category?: 'literary' | 'cultural' | 'music' | 'activist' | 'tech' | 'community' | 'other';
  registrationLink?: string;
}

export interface UpdateItem {
  id?: string;
  content: string;
  summary: string;
  oneLiner: string;
  sourceWebsite: string;
  date?: Date;
}

export interface ContentItem {
  id?: string;
  content: string;
  summary: string;
  oneLiner: string;
  sourceWebsite: string;
  date?: Date;
}

export interface NewsletterOutput {
  html: string;
  markdown: string;
  json: NewsletterData;
  metadata: {
    generatedAt: Date;
    template: string;
    itemCount: {
      events: number;
      updates: number;
      content: number;
    };
  };
}

export interface NewsletterTemplate {
  name: string;
  description: string;
  header: string;
  eventFormat: string;
  updateFormat: string;
  contentFormat: string;
  dayGroupFormat: string;
  footer: string;
  styles?: string;
  customFields?: Record<string, string>;
}

export interface NewsletterGeneratorInterface {
  generateNewsletter(options: NewsletterOptions): Promise<NewsletterOutput>;
  generateHTML(data: NewsletterData, template?: NewsletterTemplate): string;
  generateMarkdown(data: NewsletterData, template?: NewsletterTemplate): string;
  getAvailableTemplates(): Promise<NewsletterTemplate[]>;
  getTemplate(name: string): Promise<NewsletterTemplate | null>;
}

export interface PublisherInterface {
  publish(content: NewsletterOutput): Promise<PublishedResult>;
  getPublishOptions(): PublishOptions;
}

export interface PublishedResult {
  success: boolean;
  url?: string;
  message?: string;
  publishedAt: Date;
}

export interface PublishOptions {
  name: string;
  description: string;
  requiresAuth: boolean;
  configFields: ConfigField[];
}

export interface ConfigField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  required: boolean;
  description: string;
  options?: string[];
}