# Weekly Weave Bot - AI Assistant Context

## Project Overview
The Weekly Weave Bot is a modular Telegram bot designed to help curate the Weekly Weave newsletter by intelligently scraping and extracting structured data from event pages, news updates, and content links. It uses AI to understand web pages and extract relevant information without hallucination.

## Key Architecture Decisions

### Modular Design
- **Interfaces**: All major components (bot, scraper, storage) are defined as TypeScript interfaces, allowing easy swapping of implementations
- **Storage Backend**: Currently uses Airtable but can be swapped for Notion, MongoDB, etc. by implementing `StorageInterface`
- **Bot Platform**: Currently uses Telegram but can be swapped for Discord, Slack, etc. by implementing `BotInterface`
- **AI Provider**: Uses OpenAI but abstracted through `AIExtractor` class for easy provider changes

### Technical Stack
- **Language**: TypeScript with ES modules
- **Bot Framework**: Telegraf for Telegram integration
- **Web Scraping**: Cheerio for HTML parsing, Axios for HTTP requests
- **AI**: OpenAI GPT-4o-mini for intelligent extraction
- **Storage**: Airtable with structured schemas
- **Testing**: Jest with both mock and real API testing capabilities
- **Logging**: Winston with file and console outputs

## Critical Implementation Details

### Structured Data Extraction
The bot extracts JSON-LD structured data from web pages to get accurate event information:
- Located in `src/scrapers/structured-data-extractor.ts`
- Handles both single objects and arrays of structured data
- Prioritizes Event-type data when available
- Critical for accurate date extraction from event pages

### AI Extraction Logic
The `AIExtractor` class (`src/scrapers/ai-extractor.ts`) handles intelligent content extraction:
- Uses specific prompts for events, updates, and content
- Handles edge cases like "Loading..." pages with rich meta tags
- Smart date handling for recurring events
- Boulder, Colorado location detection

### Date Handling Rules
For events without explicit dates:
1. Uses structured data (JSON-LD) when available
2. For weekly recurring events, calculates next occurrence
3. Never uses past dates (2023/2024)
4. Assumes events are within the next 7 days if only time is provided

### Title Extraction Priority
1. Open Graph meta tags (`og:title`) if descriptive
2. Page `<title>` tag if not generic (e.g., not "App")
3. First `<h1>` tag as fallback

## Common Issues and Solutions

### Problem: Luma Events Show Wrong Dates
**Solution**: Extract and use JSON-LD structured data which contains accurate dates

### Problem: Actualize Events Show "App" as Title
**Solution**: Prioritize Open Graph meta tags over generic page titles

### Problem: Single Page Apps Show "Loading..."
**Solution**: Extract information from meta tags and use AI prompts that understand this pattern

## Testing Strategy

### Test Organization
- `tests/` - All test files
- Mock tests run without API keys
- Real tests require environment variables

### Running Tests
```bash
# All tests with mocks
npm test

# Real AI tests
USE_REAL_AI=1 npm test tests/real-ai-extraction.test.ts

# Interactive testing
npm run test:interactive

# Setup validation
npm run setup:validate
```

### Key Test Files
- `verified-working.test.ts` - Core functionality tests
- `dynamic-event-scraping.test.ts` - Live platform scraping
- `real-ai-extraction.test.ts` - Real OpenAI integration

## Environment Configuration

### Required API Keys
1. **TELEGRAM_BOT_TOKEN**: From @BotFather on Telegram
2. **OPENAI_API_KEY**: From platform.openai.com
3. **AIRTABLE_API_KEY**: Personal access token from Airtable
4. **AIRTABLE_BASE_ID**: From Airtable API docs

### Development Setup
```bash
# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your API keys

# Validate setup
npm run setup:validate

# Run in development
npm run dev
```

## Airtable Schema

### Events Table
- Title, Description, Venue Name, Location Address
- Start/End Datetime, Event Cost, Tags
- Source Website, Organizer info, Is Boulder flag

### Updates Table  
- One-liner, Content, Summary
- Is Boulder flag, Source Website

### Content Table
- One-liner, Content, Summary  
- Is Boulder flag, Source Website

### Errors Table
- Timestamp, Command, URL, Error details
- User ID, Additional details

## Bot Commands

- `/event <url>` - Extract event information
- `/update <url>` - Extract news/updates
- `/content <url>` - Extract general content
- `/error <details>` - Report an error (reply to bot message)
- `/help` - Show available commands

## Important Code Sections

### Web Scraper (`src/scrapers/web-scraper.ts`)
- Handles HTTP requests and HTML parsing
- Extracts structured data, meta tags, and text content
- Prioritizes quality data sources (OG tags, JSON-LD)

### AI Extractor (`src/scrapers/ai-extractor.ts`)
- Contains prompts for different content types
- Handles date calculations and Boulder detection
- Validates extracted data with Zod schemas

### Telegram Bot (`src/bot/telegram-bot.ts`)
- Implements command handling
- Manages user interactions
- Handles errors gracefully

## Development Guidelines

### Adding New Features
1. Define interfaces first
2. Implement with error handling
3. Add comprehensive tests
4. Update documentation

### Code Style
- Use TypeScript strict mode
- Async/await over callbacks
- Comprehensive error handling
- Meaningful variable names

### Testing Requirements
- Unit tests for utilities
- Integration tests for scrapers
- Mock external dependencies
- Test with real APIs when possible

## Deployment Considerations

### Production Setup
- Use environment variables for all secrets
- Enable proper logging levels
- Set up error monitoring
- Configure rate limiting

### Performance
- 10-second timeout for web requests
- Text content limited to 10k characters  
- Low temperature (0.1-0.3) for consistent AI responses
- Structured data extraction prevents AI hallucination

## Future Enhancements

### Potential Improvements
1. Add caching layer for repeated URLs
2. Implement batch processing
3. Add more storage backends (Notion, MongoDB)
4. Support more bot platforms (Discord, Slack)
5. Enhanced Boulder event detection
6. Automatic event deduplication

### Modular Extensions
- New storage: Implement `StorageInterface`
- New bot platform: Implement `BotInterface`  
- New AI provider: Extend `AIExtractor`
- New scrapers: Implement `ScraperInterface`