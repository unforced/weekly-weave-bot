import Airtable from 'airtable';
import { loadConfig } from '../src/utils/config.js';

async function debugAirtableFields() {
  try {
    const config = loadConfig();
    
    Airtable.configure({
      apiKey: config.AIRTABLE_API_KEY,
    });
    
    const base = Airtable.base(config.AIRTABLE_BASE_ID);
    
    console.log('🔍 Debugging Airtable Base...\n');
    
    // Try to list tables and fields
    const tables = ['Events', 'Updates', 'Content', 'Errors'];
    
    for (const tableName of tables) {
      console.log(`\n📋 Table: ${tableName}`);
      console.log('=' .repeat(50));
      
      try {
        const table = base(tableName);
        const records = await table.select({ 
          maxRecords: 1,
          view: 'Grid view' 
        }).firstPage();
        
        if (records.length > 0) {
          const fields = Object.keys(records[0].fields);
          console.log('✅ Table exists with fields:');
          fields.forEach(field => console.log(`  - ${field}`));
          
          // Show sample data
          console.log('\n📊 Sample record:');
          console.log(JSON.stringify(records[0].fields, null, 2));
        } else {
          console.log('✅ Table exists but is empty');
          console.log('ℹ️  Cannot determine field names without records');
          console.log('💡 Try adding a sample record manually to see field names');
        }
      } catch (error: any) {
        if (error.statusCode === 404) {
          console.log('❌ Table not found');
          console.log(`💡 Create a table named "${tableName}" in your Airtable base`);
        } else if (error.statusCode === 422 && error.message?.includes('Invalid table')) {
          console.log('❌ Table name mismatch');
          console.log('💡 Check the actual table name in your Airtable base');
        } else {
          console.log(`❌ Error: ${error.message || error}`);
        }
      }
    }
    
    console.log('\n\n📌 Common field name patterns in Airtable:');
    console.log('  - Single words: Name, Title, Description');
    console.log('  - Multiple words with spaces: "Event Title", "Start Date"');
    console.log('  - Camel case: EventTitle, StartDate');
    console.log('  - Snake case: event_title, start_date');
    
    console.log('\n💡 To fix the field name issue:');
    console.log('1. Check your Airtable base for the exact field names');
    console.log('2. Update the field mappings in airtable-storage.ts');
    console.log('3. Or rename the fields in Airtable to match the code');
    
  } catch (error) {
    console.error('Failed to debug Airtable:', error);
  }
}

// Also try the Airtable Schema API if available
async function getTableSchema() {
  try {
    const config = loadConfig();
    
    console.log('\n\n🔍 Attempting to fetch table schema...');
    
    // Note: This requires the Airtable Metadata API which may need different permissions
    const response = await fetch(
      `https://api.airtable.com/v0/meta/bases/${config.AIRTABLE_BASE_ID}/tables`,
      {
        headers: {
          'Authorization': `Bearer ${config.AIRTABLE_API_KEY}`,
        },
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n📋 Base Schema:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('ℹ️  Schema API not available (requires metadata API access)');
    }
  } catch (error) {
    console.log('ℹ️  Could not fetch schema via metadata API');
  }
}

// Run the debug script
console.log('🚀 Weekly Weave Bot - Airtable Debug Tool\n');
debugAirtableFields().then(() => getTableSchema());