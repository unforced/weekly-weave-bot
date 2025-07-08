# Weekly Weave Bot - Complete Setup Guide

This guide will walk you through setting up the Weekly Weave Bot from scratch, including obtaining all necessary API keys and configuring your environment.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Getting API Keys](#getting-api-keys)
3. [Setting Up Airtable](#setting-up-airtable)
4. [Configuring the Bot](#configuring-the-bot)
5. [Running the Bot](#running-the-bot)
6. [Testing Your Setup](#testing-your-setup)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have:
- Node.js 18 or higher installed ([Download](https://nodejs.org/))
- A Telegram account
- An OpenAI account (for API access)
- An Airtable account (free tier works)
- Basic command line knowledge

## Getting API Keys

### 1. Telegram Bot Token

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Start a conversation and send `/newbot`
3. Choose a name for your bot (e.g., "Weekly Weave Bot")
4. Choose a username (must end in 'bot', e.g., "weeklyweave_bot")
5. BotFather will give you a token like: `7150420449:AAHKZvH3_VBQtR8L9mFH3YX2kNwsXvK-abc`
6. **Save this token** - you'll need it for the TELEGRAM_BOT_TOKEN

### 2. OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Give it a name (e.g., "Weekly Weave Bot")
6. Copy the key immediately (starts with `sk-proj-`)
7. **Save this key** - you won't be able to see it again!

**Note**: OpenAI API usage is paid. You'll need to add credits to your account.

### 3. Airtable Credentials

#### Get Your API Key:
1. Go to [Airtable Account Settings](https://airtable.com/account)
2. Click on "Personal access tokens" in the API section
3. Click "Create new token"
4. Give it a name (e.g., "Weekly Weave Bot")
5. Add these scopes:
   - `data.records:read`
   - `data.records:write` 
   - `schema.bases:read`
6. Click "Create token" and copy it
7. **Save this token** - you won't be able to see it again!

#### Get Your Base ID:
1. Create a new base in Airtable (name it "Weekly Weave")
2. Open the base
3. Click on "Help" menu
4. Select "API documentation"
5. Look for "The ID of this base is" - it starts with `app`
6. Copy this Base ID (e.g., `appXXXXXXXXXXXXXX`)

### 4. Get Your Telegram User ID

1. Start a chat with [@userinfobot](https://t.me/userinfobot) on Telegram
2. It will reply with your user ID
3. Save this number for ADMIN_USER_IDS

## Setting Up Airtable

### Automatic Setup (Recommended)

We'll create a script to help you set up tables automatically. For now, follow the manual steps:

### Manual Setup

Create these four tables in your Airtable base:

#### 1. Events Table
| Field Name | Field Type | Notes |
|------------|------------|-------|
| Title | Single line text | Primary field |
| Description | Long text | |
| Venue Name | Single line text | |
| Location Address | Single line text | |
| Start Datetime | Date (Include time) | |
| End Datetime | Date (Include time) | |
| Event Cost | Single line text | |
| Tags | Single line text | |
| Source Website | URL | |
| Organizer Name | Single line text | |
| Organizer Contact | Email | |
| Is Boulder | Checkbox | |
| Created | Created time | Auto-added |

#### 2. Updates Table
| Field Name | Field Type | Notes |
|------------|------------|-------|
| One-liner | Single line text | Primary field |
| Content | Long text | |
| Summary | Long text | |
| Is Boulder | Checkbox | |
| Source Website | URL | |
| Created | Created time | Auto-added |

#### 3. Content Table
| Field Name | Field Type | Notes |
|------------|------------|-------|
| One-liner | Single line text | Primary field |
| Content | Long text | |
| Summary | Long text | |
| Is Boulder | Checkbox | |
| Source Website | URL | |
| Created | Created time | Auto-added |

#### 4. Errors Table
| Field Name | Field Type | Notes |
|------------|------------|-------|
| Timestamp | Date (Include time) | Primary field |
| Command | Single line text | |
| URL | Single line text | |
| Error | Long text | |
| User ID | Single line text | |
| Details | Long text | |
| Created | Created time | Auto-added |

## Configuring the Bot

### 1. Clone or Download the Project

```bash
# If you have git
git clone <repository-url>
cd weekly-weave-bot

# Or download and extract the ZIP file
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

```bash
# Copy the example file
cp .env.example .env

# Open .env in your text editor
```

### 4. Fill in Your Credentials

Edit `.env` with your actual values:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=7150420449:AAHKZvH3_VBQtR8L9mFH3YX2kNwsXvK-abc

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz123456789

# Airtable Configuration
AIRTABLE_API_KEY=patABCDEFGHIJKLMNOP.1234567890abcdef
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX

# Admin Configuration (your Telegram user ID)
ADMIN_USER_IDS=123456789

# Environment Configuration
NODE_ENV=development
LOG_LEVEL=info
```

## Running the Bot

### Development Mode (Recommended for Testing)

```bash
npm run dev
```

You should see:
```
[info] Weekly Weave Bot started successfully
[info] Airtable connected successfully
```

### Production Mode

```bash
# Build the TypeScript code
npm run build

# Start the bot
npm start
```

### Testing Your Bot

1. Open Telegram and search for your bot username
2. Start a conversation with `/start`
3. Try submitting a test event:
   ```
   /event https://example.com
   ```
4. The bot should respond with extracted data

## Testing Your Setup

### 1. Run the Setup Validator

```bash
npm run setup:validate
```

This will check:
- ✅ All environment variables are set
- ✅ API keys are in the correct format
- ✅ Can connect to OpenAI
- ✅ Can connect to Airtable
- ✅ Telegram bot is configured

### 2. Run Basic Tests

```bash
# Test with mock data (no API calls)
npm test

# Test with your real API keys
npm run test:real
```

### 3. Interactive Testing

Test scraping manually:
```bash
npm run test:interactive
```

## Troubleshooting

### Common Issues

#### "Invalid Telegram Bot Token"
- Make sure you copied the entire token from BotFather
- Token should be in format: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

#### "OpenAI API Key Invalid"
- Ensure your key starts with `sk-proj-`
- Check that you have credits in your OpenAI account
- Try regenerating the key if it's not working

#### "Airtable Connection Failed"
- Verify your Base ID starts with `app`
- Check that your API token has the required scopes
- Ensure table names match exactly (case-sensitive)

#### "No response from bot"
- Check the logs: `tail -f error.log`
- Ensure your bot is running: `npm run dev`
- Try restarting the bot

### Getting Help

1. Check the logs:
   - `error.log` - Error messages
   - `combined.log` - All activity

2. Run diagnostics:
   ```bash
   npm run diagnose
   ```

3. Test individual components:
   ```bash
   # Test just OpenAI
   npm run test:openai
   
   # Test just Airtable
   npm run test:airtable
   ```

## Next Steps

Once your bot is running:

1. **Customize Boulder Detection**: Edit location keywords in the configuration
2. **Add More Commands**: Extend the bot with custom commands
3. **Set Up Monitoring**: Use the error logs to track issues
4. **Deploy to Production**: Consider hosting on a VPS or cloud service

## Security Notes

- **Never commit `.env` files** to version control
- Keep your API keys secret
- Regularly rotate your API keys
- Monitor your OpenAI usage to avoid unexpected charges
- Use environment-specific configurations for production

## Support

For issues specific to:
- **Telegram Bots**: [Telegram Bot FAQ](https://core.telegram.org/bots/faq)
- **OpenAI API**: [OpenAI Help](https://help.openai.com/)
- **Airtable API**: [Airtable API Docs](https://airtable.com/developers/web/api/introduction)