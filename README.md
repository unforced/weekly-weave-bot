# Weekly Weave Bot 🤖

A modular Telegram bot that intelligently extracts event information, news updates, and content from web pages for the Weekly Weave newsletter. Built with TypeScript, AI-powered extraction, and a focus on modularity.

## Features

- 🧠 **AI-Powered Extraction**: Uses OpenAI GPT-4o-mini to intelligently extract structured data
- 📅 **Smart Event Detection**: Extracts dates, venues, costs, and organizer information
- 🏔️ **Boulder Detection**: Automatically identifies Boulder, Colorado-related content
- 🔌 **Modular Architecture**: Easy to swap storage backends, bot platforms, or AI providers
- 📊 **Structured Data Support**: Extracts JSON-LD for accurate event information
- 🧪 **Comprehensive Testing**: Full test suite with mock and real API testing

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd weekly-weave-bot

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Validate your setup
npm run setup:validate

# Run the bot
npm run dev
```

## Documentation

📚 **[View Full Documentation](docs/README.md)**

Quick links:
- 🚀 **[Quick Start Guide](docs/setup/QUICKSTART.md)** - Get running in 5 minutes
- 📖 **[Complete Setup Guide](docs/setup/SETUP_GUIDE.md)** - Detailed instructions
- 🧪 **[Testing Guide](docs/testing/TESTING_GUIDE.md)** - Run and write tests
- 🏗️ **[Architecture Overview](docs/architecture/AI_ASSISTANT_CONTEXT.md)** - Technical details
- 💻 **[Development Guide](docs/development/DEVELOPMENT_GUIDE.md)** - For contributors

## Bot Commands

- `/event <url>` - Extract event information from a webpage
- `/update <url>` - Extract news or update information
- `/content <url>` - Extract general content
- `/help` - Show available commands

## Contributing

We welcome contributions! See our [Contributing Guide](docs/contributing/CONTRIBUTING.md) for details.

Key extension points:
- `StorageInterface` - Add new storage backends
- `BotInterface` - Support new chat platforms
- `ScraperInterface` - Add specialized scrapers

## License

[Add your license here]

---

Built with ❤️ for the Boulder community and the Weekly Weave newsletter.