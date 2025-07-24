# Forking Guide - Create Your Own Bot

This bot is designed to be easily forked and customized for different use cases. The core framework handles the complexity while you focus on your specific implementation.

## Quick Start

1. **Fork this repository**
2. **Clone your fork**
3. **Install dependencies**: `npm install`
4. **Copy the example env**: `cp .env.example .env`
5. **Configure your bot**: Edit `src/implementations/weekly-weave/config/index.ts`
6. **Run**: `npm run dev`

## Architecture Overview

```
src/
├── core/                    # The bot framework (don't modify unless contributing back)
│   ├── bot/                # Multi-platform bot abstraction
│   ├── processors/         # Data processing pipeline
│   ├── storage/           # Storage abstraction
│   └── synthesizers/      # Content generation
│
├── implementations/       # Your bot implementations
│   └── weekly-weave/     # Example implementation (fork this!)
│       ├── commands/     # Bot commands
│       ├── processors/   # Data processors
│       ├── synthesizers/ # Content generators
│       ├── storage/      # Storage adapters
│       └── config/       # Configuration
│
└── main.ts              # Entry point
```

## Common Customizations

### 1. Change Location/Topic

Edit `src/implementations/weekly-weave/config/index.ts`:

```typescript
export const BOT_CONFIG = {
  name: 'Austin Tech Bot',  // Your bot name
  location: {
    name: 'Austin, TX',     // Your location
    keywords: ['Austin', 'Texas', 'ATX'],
  },
  categories: [
    { id: 'startup', name: 'Startups', color: '#e74c3c' },
    { id: 'meetup', name: 'Meetups', color: '#3498db' },
    // Your categories
  ],
};
```

### 2. Add a New Command

Create `src/implementations/your-bot/commands/custom.command.ts`:

```typescript
import { createCommand } from '../../../core/bot/builders/command.builder.js';

export const customCommand = createCommand('custom')
  .description('My custom command')
  .argument({
    name: 'input',
    type: 'string',
    required: true
  })
  .handle(async (ctx, args, response) => {
    // Your logic here
    await response.reply({
      text: `You said: ${args[0]}`
    });
  })
  .build();
```

### 3. Change Storage Provider

Implement the storage interface for your provider:

```typescript
// src/implementations/your-bot/storage/notion.adapter.ts
import { StorageProvider } from '../../../core/storage/interfaces/storage.interface.js';

export class NotionStorageAdapter implements StorageProvider {
  name = 'notion';
  
  async initialize() {
    // Connect to Notion
  }
  
  async create(collection: string, data: any) {
    // Create in Notion
  }
  
  // ... implement other methods
}
```

### 4. Add a New Platform (Discord)

```typescript
// src/core/bot/platforms/discord.adapter.ts
import { BotPlatform } from '../interfaces/bot.interface.js';

export class DiscordAdapter implements BotPlatform {
  name = 'discord';
  
  // Implement the interface
}
```

### 5. Custom Newsletter Template

```typescript
// src/implementations/your-bot/templates/custom.template.ts
export const customTemplate = {
  name: 'custom',
  description: 'My custom newsletter style',
  
  generateHTML(data: any): string {
    return `
      <h1>${data.title}</h1>
      <!-- Your custom HTML -->
    `;
  }
};
```

## Example: Food Events Bot

Here's how you'd fork this for a food events bot:

```typescript
// src/implementations/foodie-weekly/config/index.ts
export const BOT_CONFIG = {
  name: 'Foodie Weekly Bot',
  description: 'Weekly digest of food events and restaurant news',
  
  location: {
    name: 'San Francisco',
    keywords: ['SF', 'San Francisco', 'Bay Area'],
  },
  
  categories: [
    { id: 'restaurant', name: 'Restaurant Events' },
    { id: 'popup', name: 'Pop-ups' },
    { id: 'market', name: 'Farmers Markets' },
    { id: 'class', name: 'Cooking Classes' },
  ],
  
  processors: {
    // Custom scrapers for food sites
    scrapers: ['yelp-events', 'eater-sf', 'eventbrite-food'],
  }
};
```

## Best Practices

1. **Keep Core Untouched**: Don't modify files in `src/core/` unless you're contributing improvements back
2. **Use Interfaces**: Always implement the core interfaces for compatibility
3. **Configuration First**: Put settings in config files, not hardcoded
4. **Environment Variables**: Use `.env` for secrets, never commit them
5. **Test Your Changes**: Add tests for your custom implementations

## Deployment

### Quick Deploy to Heroku

```bash
heroku create your-bot-name
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set OPENAI_API_KEY=your_key
# ... other env vars
git push heroku main
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Contributing Back

If you create something useful for the core framework:

1. Keep changes in `src/core/`
2. Add tests
3. Update documentation
4. Submit a pull request

## Need Help?

- Check existing implementations in `src/implementations/`
- Read the core interfaces in `src/core/*/interfaces/`
- Look at test files for usage examples
- Open an issue for questions

## Common Patterns

### Event Processing Pipeline
```typescript
WebScraper → AI Extractor → Event Processor → Storage
```

### Newsletter Generation
```typescript
Storage Query → Data Transform → Template Render → Output
```

### Command Flow
```typescript
User Input → Command Parser → Handler → Response
```

Happy forking! 🎉