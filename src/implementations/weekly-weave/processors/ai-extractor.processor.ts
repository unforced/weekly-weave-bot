import OpenAI from 'openai';
import { 
  AIProcessor,
  AIPrompt,
  ProcessorResult 
} from '../../../core/processors/interfaces/processor.interface.js';

export interface AIExtractorConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class AIExtractorProcessor implements AIProcessor {
  name = 'ai-extractor';
  description = 'Extracts structured data using AI';
  model: string;
  temperature: number;
  maxTokens: number;
  
  private openai: OpenAI;
  
  constructor(config: AIExtractorConfig) {
    this.openai = new OpenAI({ apiKey: config.apiKey });
    this.model = config.model || 'gpt-4o-mini';
    this.temperature = config.temperature || 0.3;
    this.maxTokens = config.maxTokens || 1000;
  }
  
  async process(prompt: AIPrompt): Promise<ProcessorResult<any>> {
    try {
      const messages: any[] = [];
      
      if (prompt.system) {
        messages.push({ role: 'system', content: prompt.system });
      }
      
      // Add examples if provided
      if (prompt.examples && prompt.examples.length > 0) {
        for (const example of prompt.examples) {
          messages.push(
            { role: 'user', content: example.input },
            { role: 'assistant', content: JSON.stringify(example.output) }
          );
        }
      }
      
      messages.push({ role: 'user', content: prompt.user });
      
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        response_format: prompt.schema ? { type: 'json_object' } : undefined
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }
      
      // Parse response
      let data: any;
      try {
        data = JSON.parse(content);
      } catch {
        // If not JSON, return as string
        data = content;
      }
      
      // Validate against schema if provided
      if (prompt.schema && typeof data === 'object') {
        const validated = this.validateSchema(data, prompt.schema);
        if (!validated.valid) {
          throw new Error(`Schema validation failed: ${validated.errors.join(', ')}`);
        }
      }
      
      return {
        success: true,
        data,
        metadata: {
          model: this.model,
          tokensUsed: response.usage?.total_tokens,
          promptTokens: response.usage?.prompt_tokens,
          completionTokens: response.usage?.completion_tokens
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AI extraction failed'
      };
    }
  }
  
  validate(prompt: AIPrompt): boolean {
    return !!prompt.user && prompt.user.length > 0;
  }
  
  private validateSchema(data: any, schema: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (schema.type && typeof data !== schema.type) {
      errors.push(`Expected type ${schema.type}, got ${typeof data}`);
    }
    
    if (schema.required && Array.isArray(schema.required)) {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }
    
    if (schema.properties && typeof data === 'object') {
      for (const [key, prop] of Object.entries(schema.properties)) {
        if (key in data) {
          const fieldSchema = prop as any;
          if (fieldSchema.type && typeof data[key] !== fieldSchema.type) {
            errors.push(`Field ${key}: expected ${fieldSchema.type}, got ${typeof data[key]}`);
          }
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}