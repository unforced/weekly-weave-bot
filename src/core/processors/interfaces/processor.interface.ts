/**
 * Core processor interfaces for data extraction and transformation
 */

export interface ProcessorContext {
  url?: string;
  html?: string;
  data?: any;
  metadata?: Record<string, any>;
}

export interface ProcessorResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}

export interface Processor<TInput = any, TOutput = any> {
  name: string;
  description?: string;
  
  process(input: TInput, context?: ProcessorContext): Promise<ProcessorResult<TOutput>>;
  validate?(input: TInput): boolean;
}

export interface WebProcessor extends Processor<string, WebContent> {
  supportedDomains?: string[];
  rateLimit?: number;
}

export interface WebContent {
  title?: string;
  description?: string;
  content?: string;
  metadata?: Record<string, any>;
  structuredData?: any[];
  links?: string[];
  images?: string[];
}

export interface AIProcessor extends Processor<AIPrompt, any> {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIPrompt {
  system?: string;
  user: string;
  schema?: Record<string, any>;
  examples?: Array<{ input: string; output: any }>;
}

export interface ChainableProcessor<TInput = any, TOutput = any> 
  extends Processor<TInput, TOutput> {
  pipe<TNext>(next: Processor<TOutput, TNext>): ChainableProcessor<TInput, TNext>;
}

export interface ProcessorRegistry {
  register(processor: Processor): void;
  get(name: string): Processor | undefined;
  list(): Processor[];
  chain(...processors: Processor[]): ChainableProcessor;
}