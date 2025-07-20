# Airtable Setup Guide

To use the Weekly Weave Bot, you need to set up an Airtable base with the following tables and fields:

## 1. Create a new Airtable Base

1. Go to [Airtable](https://airtable.com)
2. Create a new base called "Weekly Weave"

## 2. Create Tables

Create the following four tables with these exact names and fields:

### Events Table
- **Title** (Single line text) - Primary field
- **Description** (Long text)
- **Venue Name** (Single line text)
- **Location Address** (Single line text)
- **Start Datetime** (Date with time)
- **End Datetime** (Date with time)
- **Event Cost** (Single line text)
- **Tags** (Single line text)
- **Source Website** (URL)
- **Organizer Name** (Single line text)
- **Organizer Contact** (Email or Single line text)
- **Is Boulder** (Checkbox)
- **Created** (Created time) - Auto-created

### Updates Table
- **One-liner** (Single line text) - Primary field
- **Content** (Long text)
- **Summary** (Long text)
- **Is Boulder** (Checkbox)
- **Source Website** (URL)
- **Created** (Created time) - Auto-created

### Content Table
- **One-liner** (Single line text) - Primary field
- **Content** (Long text)
- **Summary** (Long text)
- **Is Boulder** (Checkbox)
- **Source Website** (URL)
- **Created** (Created time) - Auto-created

### Errors Table
- **Timestamp** (Date with time) - Primary field
- **Command** (Single line text)
- **URL** (URL or Single line text)
- **Error** (Long text)
- **User ID** (Single line text)
- **Details** (Long text)
- **Created** (Created time) - Auto-created

## 3. Get Your API Credentials

1. Go to [Airtable Account](https://airtable.com/account)
2. Create a new personal access token with the following scopes:
   - `data.records:read`
   - `data.records:write`
   - `schema.bases:read`

3. Copy your Base ID:
   - Go to your base
   - Click "Help" → "API Documentation"
   - Copy the Base ID (starts with "app")

## 4. Configure the Bot

Add these to your `.env` file:
```
AIRTABLE_API_KEY=your_personal_access_token
AIRTABLE_BASE_ID=your_base_id
```