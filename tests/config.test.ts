import { loadConfig } from '../src/utils/config.js';

describe('Config Loading', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });
  
  afterAll(() => {
    process.env = originalEnv;
  });
  
  test('should load valid configuration', () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.AIRTABLE_API_KEY = 'test-airtable-key';
    process.env.AIRTABLE_BASE_ID = 'test-base-id';
    process.env.ADMIN_USER_IDS = '123,456,789';
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'debug';
    
    const config = loadConfig();
    
    expect(config.TELEGRAM_BOT_TOKEN).toBe('test-token');
    expect(config.OPENAI_API_KEY).toBe('test-openai-key');
    expect(config.AIRTABLE_API_KEY).toBe('test-airtable-key');
    expect(config.AIRTABLE_BASE_ID).toBe('test-base-id');
    expect(config.ADMIN_USER_IDS).toEqual(['123', '456', '789']);
    expect(config.NODE_ENV).toBe('test');
    expect(config.LOG_LEVEL).toBe('debug');
  });
  
  test('should use default values when optional env vars are missing', () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.AIRTABLE_API_KEY = 'test-airtable-key';
    process.env.AIRTABLE_BASE_ID = 'test-base-id';
    process.env.ADMIN_USER_IDS = '123';
    
    delete process.env.NODE_ENV;
    delete process.env.LOG_LEVEL;
    
    const config = loadConfig();
    
    expect(config.NODE_ENV).toBe('development');
    expect(config.LOG_LEVEL).toBe('info');
  });
  
  test('should handle comma-separated admin IDs with spaces', () => {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.AIRTABLE_API_KEY = 'test-airtable-key';
    process.env.AIRTABLE_BASE_ID = 'test-base-id';
    process.env.ADMIN_USER_IDS = '123, 456 , 789 ';
    
    const config = loadConfig();
    
    expect(config.ADMIN_USER_IDS).toEqual(['123', '456', '789']);
  });
});