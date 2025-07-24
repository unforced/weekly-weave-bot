# Weekly Weave Bot 🤖

A modular, forkable bot framework for creating newsletter curation bots. This implementation curates the Weekly Weave newsletter by intelligently extracting events, news, and content from web pages.

## ✨ Features

### Core Framework
- 🔌 **Platform Agnostic**: Support for Telegram, Discord, Slack (extensible)
- 🗄️ **Storage Abstraction**: Plug in any storage backend (Airtable, Notion, MongoDB)
- 🧠 **Processor Pipeline**: Chain web scraping, AI extraction, and custom processors
- 📊 **Synthesizer System**: Generate newsletters, reports, and custom outputs
- 🏗️ **Command Builder**: Fluent API for creating bot commands

### Weekly Weave Implementation  
- 📅 **Smart Event Detection**: Extracts dates, venues, costs from event pages
- 🏔️ **Location Detection**: Identifies Boulder, Colorado-related content
- 📰 **Newsletter Generation**: Creates HTML/Markdown weekly digests
- 🧪 **Comprehensive Testing**: Full test suite with mock and real API testing

## 🚀 Quick Start

```bash
# Clone and install
git clone <repository-url>
cd weekly-weave-bot
npm install

# Configure
cp .env.example .env
# Edit .env with your API keys

# Run
npm run dev
```

## 🍴 Fork This Bot!

This bot is designed to be forked and customized. See our **[Fork Guide](FORK_GUIDE.md)** for detailed instructions.

### Quick Fork Examples:

**Austin Tech Events Bot:**
```typescript
// src/implementations/austin-tech/config/index.ts
export const BOT_CONFIG = {
  name: 'Austin Tech Weekly',
  location: { name: 'Austin, TX' },
  categories: ['meetup', 'conference', 'workshop']
};
```

**Food & Culture Bot:**
```typescript
// src/implementations/foodie-weekly/config/index.ts  
export const BOT_CONFIG = {
  name: 'SF Foodie Digest',
  categories: ['restaurant', 'popup', 'market']
};
```

## 📁 Architecture

```
src/
├── core/                    # Bot framework (npm package candidate)
│   ├── bot/                # Multi-platform abstraction
│   ├── processors/         # Data processing pipeline
│   ├── storage/           # Storage abstraction
│   └── synthesizers/      # Content generation
│
├── implementations/       # Your bot implementations
│   └── weekly-weave/     # Example implementation
│
└── main.ts              # Entry point
```

## 🤖 Bot Commands

- `/event <url>` - Extract event information
- `/update <url>` - Extract news/updates
- `/content <url>` - Extract general content
- `/newsletter` - Generate weekly newsletter
- `/help` - Show commands

## 🧪 Development

```bash
# Run tests
npm test

# Type checking
npm run typecheck

# Debug Airtable fields
npm run debug:airtable

# Run specific implementation
npm run dev
```

## 📚 Documentation

- 📖 **[Setup Guide](docs/setup/SETUP_GUIDE.md)** - Detailed setup instructions
- 🍴 **[Fork Guide](FORK_GUIDE.md)** - Create your own bot
- 🏗️ **[API Reference](docs/api/INTERFACES.md)** - Core interfaces
- 🧪 **[Testing Guide](docs/testing/TESTING_GUIDE.md)** - Testing patterns
- 💻 **[Contributing](docs/contributing/CONTRIBUTING.md)** - Contribution guidelines

## 🔧 Core Concepts

### Processors
Transform data through a pipeline:
```typescript
WebScraper → AI Extractor → Event Processor → Storage
```

### Synthesizers  
Generate output from stored data:
```typescript
Storage Query → Transform → Template → Newsletter
```

### Commands
Build commands with a fluent API:
```typescript
createCommand('event')
  .description('Track an event')
  .argument({ name: 'url', type: 'url', required: true })
  .use(rateLimit(10))
  .handle(async (ctx, args, response) => {
    // Your logic
  })
  .build()
```

## 🤝 Contributing

We welcome contributions! Areas of interest:

- **Core Framework**: Improvements to the bot framework
- **Platform Adapters**: Discord, Slack, WhatsApp adapters  
- **Storage Providers**: Notion, MongoDB, PostgreSQL adapters
- **Processors**: New scrapers and extractors
- **Templates**: Newsletter and report templates

See [Contributing Guide](docs/contributing/CONTRIBUTING.md) for details.

## 📄 License

[Your License Here]

---

Built with ❤️ for creating community newsletters everywhere.