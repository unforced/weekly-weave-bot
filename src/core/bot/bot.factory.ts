import { BotPlatform, BotConfig, BotCommand, Middleware } from './interfaces/bot.interface.js';
import { TelegramAdapter } from './platforms/telegram.adapter.js';
import { Processor, ProcessorRegistry } from '../processors/interfaces/processor.interface.js';
import { StorageProvider } from '../storage/interfaces/storage.interface.js';
import { Synthesizer, SynthesizerRegistry } from '../synthesizers/interfaces/synthesizer.interface.js';

export interface BotBuilder {
  platform(platform: 'telegram' | 'discord' | 'slack', credentials: Record<string, string>): this;
  storage(provider: StorageProvider): this;
  processor(processor: Processor): this;
  synthesizer(synthesizer: Synthesizer): this;
  command(command: BotCommand): this;
  middleware(middleware: Middleware): this;
  build(): Bot;
}

export class Bot {
  private platform!: BotPlatform;
  private storage?: StorageProvider;
  private processors = new Map<string, Processor>();
  private synthesizers = new Map<string, Synthesizer>();
  private commands = new Map<string, BotCommand>();
  private middlewares: Middleware[] = [];
  
  constructor(private config: BotConfig) {}
  
  async initialize(): Promise<void> {
    // Initialize platform
    switch (this.config.platform) {
      case 'telegram':
        this.platform = new TelegramAdapter(
          this.config.credentials.token,
          {
            storage: this.storage,
            processors: this.processors,
            synthesizers: this.synthesizers
          }
        );
        break;
      // Add other platforms here
      default:
        throw new Error(`Unsupported platform: ${this.config.platform}`);
    }
    
    // Initialize storage
    if (this.storage) {
      await this.storage.initialize();
    }
    
    // Initialize platform
    await this.platform.initialize();
    
    // Register middleware
    for (const middleware of this.middlewares) {
      this.platform.registerMiddleware(middleware);
    }
    
    // Register commands
    for (const command of this.commands.values()) {
      this.platform.registerCommand(command);
    }
  }
  
  async start(): Promise<void> {
    await this.platform.start();
  }
  
  async stop(): Promise<void> {
    await this.platform.stop();
  }
  
  // Runtime methods
  getStorage(): StorageProvider | undefined {
    return this.storage;
  }
  
  getProcessor(name: string): Processor | undefined {
    return this.processors.get(name);
  }
  
  getSynthesizer(name: string): Synthesizer | undefined {
    return this.synthesizers.get(name);
  }
  
  // Builder implementation
  static create(): BotBuilder {
    const config: Partial<BotConfig> = {
      commands: [],
      middleware: []
    };
    
    const bot = new Bot(config as BotConfig);
    
    const builder: BotBuilder = {
      platform(platform: 'telegram' | 'discord' | 'slack', credentials: Record<string, string>) {
        config.platform = platform;
        config.credentials = credentials;
        return this;
      },
      
      storage(provider: StorageProvider) {
        bot.storage = provider;
        return this;
      },
      
      processor(processor: Processor) {
        bot.processors.set(processor.name, processor);
        return this;
      },
      
      synthesizer(synthesizer: Synthesizer) {
        bot.synthesizers.set(synthesizer.name, synthesizer);
        return this;
      },
      
      command(command: BotCommand) {
        bot.commands.set(command.name, command);
        return this;
      },
      
      middleware(middleware: Middleware) {
        bot.middlewares.push(middleware);
        return this;
      },
      
      build() {
        if (!config.platform || !config.credentials) {
          throw new Error('Platform and credentials are required');
        }
        
        bot.config = config as BotConfig;
        return bot;
      }
    };
    
    return builder;
  }
}

// Helper to create processor registry
export function createProcessorRegistry(): ProcessorRegistry {
  const processors = new Map<string, Processor>();
  
  return {
    register(processor: Processor) {
      processors.set(processor.name, processor);
    },
    
    get(name: string) {
      return processors.get(name);
    },
    
    list() {
      return Array.from(processors.values());
    },
    
    chain(...processorList: Processor[]) {
      // Implementation of chaining
      return processorList[0] as any; // Simplified
    }
  };
}

// Helper to create synthesizer registry
export function createSynthesizerRegistry(): SynthesizerRegistry {
  const synthesizers = new Map<string, Synthesizer>();
  
  return {
    register(synthesizer: Synthesizer) {
      synthesizers.set(synthesizer.name, synthesizer);
    },
    
    get(name: string) {
      return synthesizers.get(name);
    },
    
    list() {
      return Array.from(synthesizers.values());
    },
    
    getScheduled() {
      return this.list().filter(s => 'schedule' in s) as any[];
    }
  };
}