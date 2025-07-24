import { BotCommand, CommandHandler, BotContext, BotResponse } from '../interfaces/bot.interface.js';

export interface CommandOptions {
  name: string;
  description: string;
  category?: string;
  permissions?: string[];
  examples?: string[];
  arguments?: CommandArgument[];
}

export interface CommandArgument {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'url';
  required?: boolean;
  description?: string;
  default?: any;
  validate?: (value: any) => boolean;
}

export class CommandBuilder {
  private options: CommandOptions;
  private middlewares: Array<(ctx: BotContext, next: () => Promise<void>) => Promise<void>> = [];
  private handler?: CommandHandler;
  
  constructor(name: string) {
    this.options = { name, description: '' };
  }
  
  description(desc: string): this {
    this.options.description = desc;
    return this;
  }
  
  category(cat: string): this {
    this.options.category = cat;
    return this;
  }
  
  permissions(...perms: string[]): this {
    this.options.permissions = perms;
    return this;
  }
  
  examples(...examples: string[]): this {
    this.options.examples = examples;
    return this;
  }
  
  argument(arg: CommandArgument): this {
    if (!this.options.arguments) {
      this.options.arguments = [];
    }
    this.options.arguments.push(arg);
    return this;
  }
  
  use(middleware: (ctx: BotContext, next: () => Promise<void>) => Promise<void>): this {
    this.middlewares.push(middleware);
    return this;
  }
  
  handle(handler: CommandHandler): this {
    this.handler = handler;
    return this;
  }
  
  build(): BotCommand {
    if (!this.handler) {
      throw new Error(`No handler defined for command ${this.options.name}`);
    }
    
    const finalHandler: CommandHandler = async (ctx, args, response) => {
      // Parse and validate arguments
      const parsedArgs = this.parseArguments(args);
      
      // Run through middlewares
      let index = 0;
      const next = async () => {
        if (index < this.middlewares.length) {
          const middleware = this.middlewares[index++];
          await middleware(ctx, next);
        } else if (this.handler) {
          await this.handler(ctx, parsedArgs, response);
        }
      };
      
      await next();
    };
    
    return {
      name: this.options.name,
      description: this.options.description,
      category: this.options.category,
      permissions: this.options.permissions,
      handler: finalHandler
    };
  }
  
  private parseArguments(args: string[]): string[] {
    if (!this.options.arguments) {
      return args;
    }
    
    const parsed: string[] = [];
    
    for (let i = 0; i < this.options.arguments.length; i++) {
      const argDef = this.options.arguments[i];
      const value = args[i];
      
      if (!value && argDef.required) {
        throw new Error(`Missing required argument: ${argDef.name}`);
      }
      
      if (value) {
        // Type validation
        if (argDef.type === 'number' && isNaN(Number(value))) {
          throw new Error(`Argument ${argDef.name} must be a number`);
        }
        
        if (argDef.type === 'url' && !this.isValidUrl(value)) {
          throw new Error(`Argument ${argDef.name} must be a valid URL`);
        }
        
        if (argDef.validate && !argDef.validate(value)) {
          throw new Error(`Invalid value for argument ${argDef.name}`);
        }
        
        parsed.push(value);
      } else if (argDef.default !== undefined) {
        parsed.push(argDef.default);
      }
    }
    
    return parsed;
  }
  
  private isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }
}

// Helper function to create commands
export function createCommand(name: string): CommandBuilder {
  return new CommandBuilder(name);
}

// Common middleware
export const requireAuth = (requiredRole?: string) => {
  return async (ctx: BotContext, next: () => Promise<void>) => {
    // Check user authentication
    if (!ctx.userId) {
      throw new Error('Authentication required');
    }
    
    // Check role if specified
    if (requiredRole) {
      // Implementation depends on your auth system
      const userRole = await getUserRole(ctx.userId);
      if (userRole !== requiredRole) {
        throw new Error('Insufficient permissions');
      }
    }
    
    await next();
  };
};

export const rateLimit = (maxPerMinute: number) => {
  const requests = new Map<string, number[]>();
  
  return async (ctx: BotContext, next: () => Promise<void>) => {
    const key = ctx.userId || ctx.chatId || 'anonymous';
    const now = Date.now();
    const minute = 60 * 1000;
    
    // Get requests in the last minute
    const userRequests = requests.get(key) || [];
    const recentRequests = userRequests.filter(time => now - time < minute);
    
    if (recentRequests.length >= maxPerMinute) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    recentRequests.push(now);
    requests.set(key, recentRequests);
    
    await next();
  };
};

// Placeholder for auth
async function getUserRole(userId: string): Promise<string> {
  // Implementation depends on your system
  return 'user';
}