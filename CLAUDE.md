# Weekly Weave Bot - AI Assistant Context

## Project Overview
The Weekly Weave Bot is a modular Telegram bot designed to help curate the Weekly Weave newsletter by intelligently scraping and extracting structured data from event pages, news updates, and content links. It uses AI to understand web pages and extract relevant information without hallucination.

## Recent Development History
This project was built from scratch with the following key milestones:
1. Initial architecture with modular interfaces for easy component swapping
2. Implementation of web scraping with structured data extraction
3. AI-powered extraction using OpenAI GPT-4o-mini
4. Comprehensive testing framework with mock and real API support
5. Bug fixes for Luma and Actualize event extraction
6. Documentation reorganization and improvement

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
- Created as separate module to fix method binding issues

### AI Extraction Logic
The `AIExtractor` class (`src/scrapers/ai-extractor.ts`) handles intelligent content extraction:
- Uses specific prompts for events, updates, and content
- Handles edge cases like "Loading..." pages with rich meta tags
- Smart date handling for recurring events
- Boulder, Colorado location detection
- Fixed to include "JSON" in prompts for OpenAI API compliance

### Date Handling Rules
For events without explicit dates:
1. Uses structured data (JSON-LD) when available
2. For weekly recurring events, calculates next occurrence
3. Never uses past dates (2023/2024)
4. Assumes events are within the next 7 days if only time is provided
5. For recurring weekly events on current day, uses today's date if time hasn't passed

### Title Extraction Priority
1. Open Graph meta tags (`og:title`) if descriptive
2. Page `<title>` tag if not generic (e.g., not "App")
3. First `<h1>` tag as fallback

## Recent Bug Fixes

### Luma Events (lu.ma/godmachine)
- **Problem**: Events showed invalid/missing dates
- **Root Cause**: Structured data wasn't being passed to AI extractor
- **Solution**: 
  1. Added `structuredData` field to `WebPageData` interface
  2. Created separate `structured-data-extractor.ts` module
  3. Updated AI prompts to prioritize structured data

### Actualize Events (app.actualize.earth)
- **Problem**: Title showed as "App" and dates from 2023
- **Root Cause**: Single Page App with "Loading..." content
- **Solution**:
  1. Prioritized Open Graph meta tags for title extraction
  2. Enhanced AI prompts to handle SPAs and recurring events
  3. Added logic to use current dates for weekly events

## Testing Strategy

### Test Organization
- `tests/` - All test files
- Mock tests run without API keys
- Real tests require environment variables
- Dynamic scraping tests fetch fresh events from platform homepages

### Running Tests
```bash
# All tests with mocks
npm test

# Real AI tests
USE_REAL_AI=1 npm test

# Specific test file
npm test tests/verified-working.test.ts

# Interactive testing
npm run test:interactive

# Setup validation
npm run setup:validate
```

### Key Test Files
- `verified-working.test.ts` - Core functionality tests (7/7 passing)
- `dynamic-event-scraping.test.ts` - Live platform scraping
- `real-ai-extraction.test.ts` - Real OpenAI integration

## Documentation Structure
```
weekly-weave-bot/
├── README.md                 # Concise project overview
├── CLAUDE.md                 # This file - AI assistant context
├── docs/
│   ├── README.md            # Documentation index
│   ├── setup/
│   │   ├── SETUP_GUIDE.md   # Detailed setup instructions
│   │   └── QUICKSTART.md    # Quick start guide
│   ├── architecture/
│   │   └── AI_ASSISTANT_CONTEXT.md  # Detailed technical context
│   ├── api/
│   │   └── INTERFACES.md    # API reference
│   ├── development/
│   │   └── DEVELOPMENT_GUIDE.md  # Development workflow
│   ├── testing/
│   │   └── TESTING_GUIDE.md # Testing documentation
│   └── contributing/
│       └── CONTRIBUTING.md   # Contribution guidelines
```

## Environment Configuration

### Required API Keys
1. **TELEGRAM_BOT_TOKEN**: From @BotFather on Telegram
2. **OPENAI_API_KEY**: From platform.openai.com
3. **AIRTABLE_API_KEY**: Personal access token from Airtable
4. **AIRTABLE_BASE_ID**: From Airtable API docs

### Optional Configuration
- **LOG_LEVEL**: Set to 'debug' for verbose logging
- **NODE_ENV**: Set to 'production' for production mode

## Common Development Tasks

### Adding a New Storage Backend
1. Create new file in `src/storage/`
2. Implement `StorageInterface` from `src/interfaces/storage.interface.ts`
3. Update `src/storage/index.ts` to export new implementation
4. Add configuration in `src/utils/config.ts`
5. Write tests in `tests/`

### Adding a New Bot Platform
1. Create new file in `src/bot/`
2. Implement `BotInterface` from `src/interfaces/bot.interface.ts`
3. Update command handlers to match platform's API
4. Add platform-specific configuration

### Debugging Extraction Issues
1. Check structured data extraction: `src/scrapers/structured-data-extractor.ts`
2. Review AI prompts in `src/scrapers/ai-extractor.ts`
3. Verify meta tag extraction in `src/scrapers/web-scraper.ts`
4. Use `npm run test:interactive` for manual verification

## Important Code Patterns

### Error Handling
```typescript
try {
  // Operation
} catch (error) {
  logger.error('Context message:', error);
  throw new Error('User-friendly message');
}
```

### Type Guards for Telegram
```typescript
const text = (ctx.message && 'text' in ctx.message) ? ctx.message.text : '';
```

### AI Prompt Structure
- Always include "Return your response as a JSON object"
- Provide current date/time context for event extraction
- Be explicit about field requirements and formats

## Performance Considerations
- 10-second timeout for web requests
- Text content limited to 10k characters
- Low temperature (0.1-0.3) for consistent AI responses
- Structured data extraction prevents AI hallucination

## Known Limitations
1. Event URLs expire over time (tests use dynamic scraping)
2. Some SPAs require special handling for content extraction
3. AI token costs scale with usage (GPT-4o-mini is cost-effective)
4. Airtable free tier has record limits

## Future Enhancements
1. Add caching layer for repeated URLs
2. Implement batch processing for multiple URLs
3. Add more storage backends (Notion, MongoDB)
4. Support more bot platforms (Discord, Slack)
5. Enhanced Boulder event detection with geo-coordinates
6. Automatic event deduplication
7. Event reminder system
8. Newsletter generation automation

## Troubleshooting Quick Reference

### "Messages must contain the word 'json'"
Add "Return your response as a JSON object" to AI prompts

### Structured data returns empty
Check if `structured-data-extractor.ts` is properly imported and used

### Tests fail with 404
Event URLs may have expired - use platform homepage URLs instead

### "App" appears as title
Page is likely an SPA - check Open Graph meta tags are being extracted

### Dates show as 2023/2024
Recurring event without explicit date - AI prompts now handle this

## Contact for Original Context
This bot was developed with specific requirements for the Weekly Weave newsletter in Boulder, Colorado. The architecture prioritizes modularity and maintainability for easy community contributions and platform migrations.