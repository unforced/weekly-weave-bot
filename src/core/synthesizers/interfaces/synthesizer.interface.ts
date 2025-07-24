/**
 * Core synthesizer interfaces for querying and generating content
 */

export interface Synthesizer<TOptions = any, TOutput = any> {
  name: string;
  description?: string;
  
  synthesize(options: TOptions): Promise<SynthesisResult<TOutput>>;
  preview?(options: TOptions): Promise<string>;
  getTemplates?(): Promise<Template[]>;
}

export interface SynthesisResult<T = any> {
  success: boolean;
  output?: T;
  error?: string;
  metadata?: SynthesisMetadata;
}

export interface SynthesisMetadata {
  generatedAt: Date;
  duration: number;
  itemCount?: Record<string, number>;
  template?: string;
  [key: string]: any;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  preview?: string;
  variables?: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array';
  required?: boolean;
  default?: any;
  description?: string;
}

export interface QuerySynthesizer<TQuery = any, TOutput = any> 
  extends Synthesizer<QueryOptions<TQuery>, TOutput> {
  
  buildQuery(options: TQuery): any;
  transform?(data: any[]): any[];
}

export interface QueryOptions<T = any> {
  query: T;
  template?: string;
  format?: 'html' | 'markdown' | 'json' | 'text';
  metadata?: Record<string, any>;
}

export interface ScheduledSynthesizer extends Synthesizer {
  schedule?: string; // cron expression
  shouldRun(date: Date): boolean;
  getNextRun(from?: Date): Date | null;
}

export interface InteractiveSynthesizer extends Synthesizer {
  getOptions(): Promise<SynthesizerOption[]>;
  validate(options: any): ValidationResult;
}

export interface SynthesizerOption {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'date';
  label: string;
  required?: boolean;
  default?: any;
  choices?: Array<{ value: any; label: string }>;
  validation?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors?: Array<{ field: string; message: string }>;
}

export interface SynthesizerRegistry {
  register(synthesizer: Synthesizer): void;
  get(name: string): Synthesizer | undefined;
  list(): Synthesizer[];
  getScheduled(): ScheduledSynthesizer[];
}