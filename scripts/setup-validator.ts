#!/usr/bin/env tsx
/**
 * Setup Validator - Checks that all dependencies and API connections are working
 */

import dotenv from 'dotenv';
import chalk from 'chalk';
import { OpenAI } from 'openai';
import Airtable from 'airtable';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

interface ValidationResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

const results: ValidationResult[] = [];

function addResult(name: string, status: 'success' | 'error' | 'warning', message: string) {
  results.push({ name, status, message });
}

// Check Node.js version
function checkNodeVersion() {
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.split('.')[0].substring(1));
  
  if (major >= 18) {
    addResult('Node.js Version', 'success', `Version ${nodeVersion} (>= 18.0.0)`);
  } else {
    addResult('Node.js Version', 'error', `Version ${nodeVersion} (requires >= 18.0.0)`);
  }
}

// Check environment variables
function checkEnvironmentVariables() {
  const required = [
    'TELEGRAM_BOT_TOKEN',
    'OPENAI_API_KEY',
    'AIRTABLE_API_KEY',
    'AIRTABLE_BASE_ID',
    'ADMIN_USER_IDS'
  ];
  
  let allPresent = true;
  
  for (const varName of required) {
    const value = process.env[varName];
    if (!value || value === `your_${varName.toLowerCase()}`) {
      addResult(`Environment: ${varName}`, 'error', 'Not set or still has example value');
      allPresent = false;
    } else {
      // Mask sensitive values
      let displayValue = value;
      if (varName.includes('KEY') || varName.includes('TOKEN')) {
        displayValue = value.substring(0, 10) + '...' + value.substring(value.length - 4);
      }
      addResult(`Environment: ${varName}`, 'success', `Set (${displayValue})`);
    }
  }
  
  return allPresent;
}

// Validate API key formats
function validateApiKeyFormats() {
  const token = process.env.TELEGRAM_BOT_TOKEN || '';
  const openaiKey = process.env.OPENAI_API_KEY || '';
  const airtableKey = process.env.AIRTABLE_API_KEY || '';
  const baseId = process.env.AIRTABLE_BASE_ID || '';
  
  // Telegram bot token format: numeric:alphanumeric
  if (token && /^\d+:[A-Za-z0-9_-]+$/.test(token)) {
    addResult('Telegram Token Format', 'success', 'Valid format');
  } else {
    addResult('Telegram Token Format', 'error', 'Invalid format (should be numeric:alphanumeric)');
  }
  
  // OpenAI key format
  if (openaiKey && openaiKey.startsWith('sk-')) {
    addResult('OpenAI Key Format', 'success', 'Valid format');
  } else {
    addResult('OpenAI Key Format', 'error', 'Invalid format (should start with sk-)');
  }
  
  // Airtable key format
  if (airtableKey && (airtableKey.startsWith('key') || airtableKey.startsWith('pat'))) {
    addResult('Airtable Key Format', 'success', 'Valid format');
  } else {
    addResult('Airtable Key Format', 'error', 'Invalid format (should start with key or pat)');
  }
  
  // Airtable base ID format
  if (baseId && baseId.startsWith('app')) {
    addResult('Airtable Base ID Format', 'success', 'Valid format');
  } else {
    addResult('Airtable Base ID Format', 'error', 'Invalid format (should start with app)');
  }
}

// Test OpenAI connection
async function testOpenAIConnection() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !apiKey.startsWith('sk-')) {
    addResult('OpenAI Connection', 'error', 'Invalid or missing API key');
    return;
  }
  
  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.models.list();
    
    // Check if we have access to required model
    const hasGPT4Mini = response.data.some(model => model.id.includes('gpt-4o-mini'));
    
    if (hasGPT4Mini) {
      addResult('OpenAI Connection', 'success', 'Connected successfully, GPT-4o-mini available');
    } else {
      addResult('OpenAI Connection', 'warning', 'Connected but GPT-4o-mini not found');
    }
  } catch (error: any) {
    if (error.status === 401) {
      addResult('OpenAI Connection', 'error', 'Invalid API key');
    } else if (error.status === 429) {
      addResult('OpenAI Connection', 'error', 'Rate limit exceeded or no credits');
    } else {
      addResult('OpenAI Connection', 'error', `Failed: ${error.message}`);
    }
  }
}

// Test Airtable connection
async function testAirtableConnection() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  
  if (!apiKey || !baseId) {
    addResult('Airtable Connection', 'error', 'Missing API key or Base ID');
    return;
  }
  
  try {
    const airtable = new Airtable({ apiKey });
    const base = airtable.base(baseId);
    
    // Try to list tables
    const requiredTables = ['Events', 'Updates', 'Content', 'Errors'];
    let foundTables = 0;
    
    for (const tableName of requiredTables) {
      try {
        // Try to query each table
        await base(tableName).select({ maxRecords: 1 }).firstPage();
        foundTables++;
      } catch (error: any) {
        if (error.statusCode === 404) {
          addResult(`Airtable Table: ${tableName}`, 'error', 'Table not found');
        }
      }
    }
    
    if (foundTables === requiredTables.length) {
      addResult('Airtable Connection', 'success', 'Connected, all tables found');
    } else {
      addResult('Airtable Connection', 'warning', `Connected, but only ${foundTables}/${requiredTables.length} tables found`);
    }
  } catch (error: any) {
    if (error.statusCode === 401) {
      addResult('Airtable Connection', 'error', 'Invalid API key');
    } else if (error.statusCode === 404) {
      addResult('Airtable Connection', 'error', 'Invalid Base ID');
    } else {
      addResult('Airtable Connection', 'error', `Failed: ${error.message}`);
    }
  }
}

// Test Telegram bot token
async function testTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    addResult('Telegram Bot', 'error', 'Missing bot token');
    return;
  }
  
  try {
    const response = await axios.get(`https://api.telegram.org/bot${token}/getMe`);
    if (response.data.ok) {
      const bot = response.data.result;
      addResult('Telegram Bot', 'success', `Connected as @${bot.username}`);
    } else {
      addResult('Telegram Bot', 'error', 'Invalid response from Telegram');
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      addResult('Telegram Bot', 'error', 'Invalid bot token');
    } else {
      addResult('Telegram Bot', 'error', `Failed: ${error.message}`);
    }
  }
}

// Check file structure
function checkFileStructure() {
  const requiredDirs = ['src', 'tests', 'config', 'scripts'];
  const requiredFiles = ['.env', 'package.json', 'tsconfig.json'];
  
  let allGood = true;
  
  // Check directories
  for (const dir of requiredDirs) {
    if (fs.existsSync(path.join(process.cwd(), dir))) {
      addResult(`Directory: ${dir}`, 'success', 'Found');
    } else {
      addResult(`Directory: ${dir}`, 'error', 'Not found');
      allGood = false;
    }
  }
  
  // Check files
  for (const file of requiredFiles) {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      addResult(`File: ${file}`, 'success', 'Found');
    } else {
      addResult(`File: ${file}`, 'error', 'Not found');
      allGood = false;
    }
  }
  
  return allGood;
}

// Print results
function printResults() {
  console.log(chalk.cyan.bold('\n🔍 Weekly Weave Bot - Setup Validation\n'));
  
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  
  for (const result of results) {
    const icon = result.status === 'success' ? '✅' : 
                 result.status === 'error' ? '❌' : '⚠️';
    const color = result.status === 'success' ? chalk.green :
                  result.status === 'error' ? chalk.red : chalk.yellow;
    
    console.log(`${icon} ${color(result.name)}: ${result.message}`);
  }
  
  console.log(chalk.cyan('\n📊 Summary:'));
  console.log(chalk.green(`   ✅ Success: ${successCount}`));
  console.log(chalk.yellow(`   ⚠️  Warnings: ${warningCount}`));
  console.log(chalk.red(`   ❌ Errors: ${errorCount}`));
  
  if (errorCount === 0) {
    console.log(chalk.green.bold('\n🎉 All checks passed! Your bot is ready to run.\n'));
    console.log(chalk.cyan('Next steps:'));
    console.log('1. Run the bot: npm run dev');
    console.log('2. Test with: npm run test:interactive\n');
  } else {
    console.log(chalk.red.bold('\n❌ Setup validation failed. Please fix the errors above.\n'));
    console.log(chalk.yellow('Need help? Check SETUP_GUIDE.md for detailed instructions.\n'));
  }
}

// Main validation flow
async function validate() {
  console.log(chalk.cyan('Starting validation...\n'));
  
  // Basic checks
  checkNodeVersion();
  checkFileStructure();
  
  // Environment checks
  const hasEnvVars = checkEnvironmentVariables();
  
  if (hasEnvVars) {
    validateApiKeyFormats();
    
    // API connection tests
    console.log(chalk.gray('Testing API connections...'));
    
    await Promise.all([
      testOpenAIConnection(),
      testAirtableConnection(),
      testTelegramBot()
    ]);
  }
  
  printResults();
  
  // Exit with error code if there were errors
  const errorCount = results.filter(r => r.status === 'error').length;
  process.exit(errorCount > 0 ? 1 : 0);
}

// Run validation
validate().catch(error => {
  console.error(chalk.red('Validation script error:'), error);
  process.exit(1);
});