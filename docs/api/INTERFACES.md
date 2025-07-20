# Weekly Weave Bot - API & Interface Documentation

## Core Interfaces

The Weekly Weave Bot is built with a modular architecture using TypeScript interfaces. This allows for easy extension and replacement of components.

### BotInterface

Located in `src/interfaces/bot.interface.ts`

The `BotInterface` defines the contract for any bot implementation (currently Telegram, but could be extended to Discord, Slack, etc.).

```typescript
interface BotInterface {
  start(): Promise<void>;
  stop(): Promise<void>;
  sendMessage(chatId: string | number, message: string): Promise<void>;
  // Additional methods as defined in the interface
}
```

### ScraperInterface

Located in `src/interfaces/scraper.interface.ts`

The `ScraperInterface` defines how web scrapers should extract data from URLs.

```typescript
interface ScraperInterface {
  scrapeUrl(url: string): Promise<ScrapedData>;
  extractStructuredData(html: string): any;
  // Additional methods as defined in the interface
}
```

### StorageInterface

Located in `src/interfaces/storage.interface.ts`

The `StorageInterface` abstracts the storage layer, allowing different backends (Airtable, MongoDB, etc.).

```typescript
interface StorageInterface {
  saveEvent(event: EventData): Promise<void>;
  saveUpdate(update: UpdateData): Promise<void>;
  saveContent(content: ContentData): Promise<void>;
  saveError(error: ErrorData): Promise<void>;
  // Additional methods as defined in the interface
}
```

## Data Types

### EventData
Structure for event information:
- `title`: string - Event title
- `description`: string - Event description
- `venueName`: string - Venue name
- `locationAddress`: string - Physical address
- `startDatetime`: Date - Event start time
- `endDatetime`: Date - Event end time
- `eventCost`: string - Cost information
- `tags`: string - Event tags
- `sourceWebsite`: string - Original URL
- `organizerName`: string - Organizer name
- `organizerContact`: string - Contact information
- `isBoulder`: boolean - Boulder-related flag

### UpdateData
Structure for news/updates:
- `oneLiner`: string - Brief summary (≤15 words)
- `content`: string - Full content
- `summary`: string - AI-generated summary
- `isBoulder`: boolean - Boulder-related flag
- `sourceWebsite`: string - Original URL

### ContentData
Structure for general content:
- `oneLiner`: string - Brief summary (≤15 words)
- `content`: string - Full content
- `summary`: string - AI-generated summary
- `isBoulder`: boolean - Boulder-related flag
- `sourceWebsite`: string - Original URL

## Implementing Custom Components

### Creating a New Bot Platform

```typescript
import { BotInterface } from './interfaces/bot.interface';

export class DiscordBot implements BotInterface {
  async start(): Promise<void> {
    // Initialize Discord connection
  }
  
  async stop(): Promise<void> {
    // Cleanup Discord connection
  }
  
  async sendMessage(chatId: string, message: string): Promise<void> {
    // Send message via Discord API
  }
}
```

### Creating a New Storage Backend

```typescript
import { StorageInterface } from './interfaces/storage.interface';

export class MongoDBStorage implements StorageInterface {
  async saveEvent(event: EventData): Promise<void> {
    // Save to MongoDB
  }
  
  // Implement other required methods
}
```

### Creating a Specialized Scraper

```typescript
import { ScraperInterface } from './interfaces/scraper.interface';

export class EventbriteScraper implements ScraperInterface {
  async scrapeUrl(url: string): Promise<ScrapedData> {
    // Custom Eventbrite scraping logic
  }
  
  // Implement other required methods
}
```

## API Endpoints (Bot Commands)

### `/event <url>`
Extracts event information from the provided URL.

**Response includes:**
- Event details (title, date, venue, etc.)
- Boulder detection result
- Structured data if available

### `/update <url>`
Extracts news or update information from the provided URL.

**Response includes:**
- One-liner summary
- Full content extract
- AI-generated summary
- Boulder detection result

### `/content <url>`
Extracts general content from the provided URL.

**Response includes:**
- One-liner summary
- Content extract
- AI-generated summary
- Boulder detection result

### `/error <details>`
Reports an error with a previous bot response.

**Usage:** Reply to a bot message with this command

### `/help`
Shows available commands and usage information.

## Environment Variables

See the [Setup Guide](../setup/SETUP_GUIDE.md) for required environment variables.