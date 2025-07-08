# Weekly Weave Bot

A modular Telegram bot for tracking events, updates, and content for the Weekly Weave newsletter.

## Features

- **Telegram Commands**: `/event`, `/update`, `/content` - Submit links for scraping
- **Intelligent Scraping**: AI-powered extraction of structured data from web pages
- **Airtable Integration**: Automatic storage of scraped data with schema management
- **Error Handling**: Comprehensive error logging and user feedback
- **Modular Architecture**: Easy to swap storage backends or messaging interfaces

## Project Structure

```
weekly-weave-bot/
├── src/
│   ├── bot/           # Telegram bot implementation
│   ├── scrapers/      # Web scraping and AI extraction
│   ├── storage/       # Storage implementations (Airtable, etc.)
│   ├── interfaces/    # TypeScript interfaces for modularity
│   ├── types/         # Shared types
│   └── utils/         # Configuration, logging, helpers
├── tests/             # Test files
├── config/            # Configuration files
└── dist/              # Compiled JavaScript output
```

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials
2. Install dependencies: `npm install`
3. Run in development mode: `npm run dev`

## Testing

Run tests with: `npm test`

## Building

Build for production: `npm run build`

## Modular Design

The bot is designed with interfaces to allow easy swapping of components:

- **Storage**: Implement `StorageInterface` to use different backends (Notion, MongoDB, etc.)
- **Bot**: Implement `BotInterface` to use different messaging platforms (Discord, Slack, etc.)
- **Scraper**: Implement `ScraperInterface` to customize extraction logic