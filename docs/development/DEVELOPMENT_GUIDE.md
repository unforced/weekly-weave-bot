# Weekly Weave Bot - Development Guide

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- TypeScript knowledge
- Git for version control
- VS Code or similar IDE (recommended)

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd weekly-weave-bot

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Validate setup
npm run setup:validate
```

## Development Workflow

### Running in Development Mode

```bash
# Start with hot-reload
npm run dev

# Watch for TypeScript errors
npm run type-check -- --watch
```

### Code Structure

```
src/
├── bot/              # Telegram bot implementation
│   ├── telegram-bot.ts
│   └── commands.ts
├── scrapers/         # Web scraping logic
│   ├── web-scraper.ts
│   ├── ai-extractor.ts
│   ├── intelligent-scraper.ts
│   └── structured-data-extractor.ts
├── storage/          # Storage implementations
│   └── airtable-storage.ts
├── interfaces/       # TypeScript interfaces
│   ├── bot.interface.ts
│   ├── scraper.interface.ts
│   └── storage.interface.ts
├── utils/           # Utilities
│   ├── config.ts
│   └── logger.ts
├── types/           # Type definitions
└── index.ts         # Entry point
```

### TypeScript Configuration

The project uses strict TypeScript settings for type safety:
- `strict: true` - Enable all strict type checking
- `esModuleInterop: true` - CommonJS/ES Module interop
- `target: "ES2022"` - Modern JavaScript features

## Coding Standards

### Style Guide

1. **Use TypeScript strictly**
   ```typescript
   // Good
   function processEvent(url: string): Promise<EventData> {
     // ...
   }
   
   // Bad
   function processEvent(url: any) {
     // ...
   }
   ```

2. **Async/Await over Promises**
   ```typescript
   // Good
   const data = await scraper.scrapeUrl(url);
   
   // Avoid
   scraper.scrapeUrl(url).then(data => {
     // ...
   });
   ```

3. **Error Handling**
   ```typescript
   try {
     const result = await riskyOperation();
   } catch (error) {
     logger.error('Operation failed:', error);
     // Handle gracefully
   }
   ```

4. **Meaningful Names**
   ```typescript
   // Good
   const eventStartDate = extractEventDate(data);
   
   // Bad
   const d = getDate(x);
   ```

### Logging

Use the Winston logger for all logging:

```typescript
import { logger } from '../utils/logger';

// Log levels
logger.debug('Detailed debug info');
logger.info('General information');
logger.warn('Warning messages');
logger.error('Error messages', error);
```

## Testing

### Running Tests

```bash
# All tests with mocks
npm test

# Specific test file
npm test tests/ai-extractor.test.ts

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Writing Tests

```typescript
import { AIExtractor } from '../src/scrapers/ai-extractor';

describe('AIExtractor', () => {
  let extractor: AIExtractor;
  
  beforeEach(() => {
    extractor = new AIExtractor('mock-api-key');
  });
  
  it('should extract event data correctly', async () => {
    const result = await extractor.extractEventData(mockData);
    expect(result.title).toBe('Expected Title');
  });
});
```

### Test Categories

1. **Unit Tests** - Test individual functions/classes
2. **Integration Tests** - Test component interactions
3. **E2E Tests** - Test full workflows

## Adding New Features

### 1. Adding a New Bot Command

```typescript
// In src/bot/commands.ts
bot.command('newcommand', async (ctx) => {
  const url = ctx.message.text.split(' ')[1];
  
  if (!url) {
    return ctx.reply('Please provide a URL');
  }
  
  // Implementation
});
```

### 2. Adding a New Storage Backend

1. Create new file in `src/storage/`
2. Implement `StorageInterface`
3. Update configuration to use new backend

```typescript
export class NotionStorage implements StorageInterface {
  async saveEvent(event: EventData): Promise<void> {
    // Notion API implementation
  }
  // ... other methods
}
```

### 3. Adding a New Scraper

```typescript
export class MeetupScraper extends WebScraper {
  async extractSpecificData(html: string): Promise<any> {
    // Meetup-specific extraction logic
  }
}
```

## Debugging

### Using VS Code Debugger

1. Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Bot",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/src/index.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

2. Set breakpoints in TypeScript files
3. Press F5 to start debugging

### Common Issues

1. **TypeScript Errors**
   ```bash
   npm run type-check
   ```

2. **Module Resolution Issues**
   - Check `tsconfig.json` paths
   - Ensure proper imports

3. **API Rate Limits**
   - Implement exponential backoff
   - Cache responses when possible

## Performance Optimization

### Caching
```typescript
const cache = new Map<string, CachedData>();

async function getCachedOrFetch(url: string): Promise<Data> {
  if (cache.has(url)) {
    return cache.get(url);
  }
  
  const data = await fetchData(url);
  cache.set(url, data);
  return data;
}
```

### Timeouts
```typescript
const axiosConfig = {
  timeout: 10000, // 10 seconds
  validateStatus: (status) => status < 500
};
```

## Deployment Considerations

### Environment Variables
- Never commit `.env` files
- Use different values for development/production
- Document all required variables

### Production Build
```bash
# Build for production
npm run build

# Run production build
NODE_ENV=production npm start
```

### Monitoring
- Set up error tracking (Sentry, etc.)
- Monitor API usage and costs
- Track performance metrics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add/update tests
5. Submit a pull request

See [Contributing Guidelines](../contributing/CONTRIBUTING.md) for more details.