/**
 * Weekly Weave Bot Configuration
 * This is where you customize the bot for your specific use case
 */

export const BOT_CONFIG = {
  name: 'Weekly Weave Bot',
  description: 'A bot for curating weekly newsletters from events and content',
  
  location: {
    name: 'Boulder, CO',
    timezone: 'America/Denver',
    // Used to filter local events
    keywords: ['Boulder', 'Colorado', 'Denver', 'Front Range'],
  },
  
  categories: [
    { id: 'tech', name: 'Technology', color: '#3498db' },
    { id: 'music', name: 'Music & Arts', color: '#e74c3c' },
    { id: 'community', name: 'Community', color: '#2ecc71' },
    { id: 'outdoor', name: 'Outdoor & Recreation', color: '#f39c12' },
  ],
  
  commands: {
    // Which commands to enable
    event: true,
    update: true,
    content: true,
    newsletter: true,
    admin: {
      init: true,
      debug: true,
    }
  },
  
  newsletter: {
    defaultTemplate: 'default',
    schedule: 'weekly', // weekly, biweekly, monthly
    dayOfWeek: 1, // Monday
    includeEvents: true,
    includeUpdates: true,
    includeContent: true,
  },
  
  storage: {
    // These would come from environment variables
    provider: 'airtable',
    collections: {
      events: 'Events',
      updates: 'Updates', 
      content: 'Content',
      errors: 'Errors',
    }
  },
  
  processors: {
    // AI model for extraction
    aiModel: 'gpt-4o-mini',
    aiTemperature: 0.3,
    
    // Web scraping
    requestTimeout: 10000,
    maxContentLength: 10000,
  }
};

// Environment-specific overrides
export function getConfig() {
  const config = { ...BOT_CONFIG };
  
  // Override with environment-specific settings
  if (process.env.BOT_NAME) {
    config.name = process.env.BOT_NAME;
  }
  
  if (process.env.LOCATION_NAME) {
    config.location.name = process.env.LOCATION_NAME;
  }
  
  return config;
}