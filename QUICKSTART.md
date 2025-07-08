# Weekly Weave Bot - Quick Start Guide

## Prerequisites

1. Node.js 18+ installed
2. Telegram Bot Token (from @BotFather)
3. OpenAI API Key
4. Airtable Account with API Key

## Setup Steps

### 1. Install Dependencies

```bash
cd weekly-weave-bot
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
```
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
OPENAI_API_KEY=your_openai_api_key
AIRTABLE_API_KEY=your_airtable_personal_access_token
AIRTABLE_BASE_ID=your_airtable_base_id
ADMIN_USER_IDS=your_telegram_user_id
```

### 3. Set Up Airtable

Follow the guide in `scripts/setup-airtable.md` to create your Airtable base with the required tables.

### 4. Start the Bot

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## Using the Bot

1. Start a chat with your bot on Telegram
2. Available commands:
   - `/event <url>` - Submit an event link
   - `/update <url>` - Submit an update link  
   - `/content <url>` - Submit a content link
   - `/error <details>` - Report an error (reply to a bot message)
   - `/help` - Show available commands

## Testing

Run tests:
```bash
npm test
```

Test live scraping:
```bash
tsx tests/live-scraping-test.ts https://lu.ma/some-event
```

## Troubleshooting

- Check logs in `error.log` and `combined.log`
- Verify all environment variables are set correctly
- Ensure Airtable tables match the expected schema
- Test with the live scraping script to debug issues