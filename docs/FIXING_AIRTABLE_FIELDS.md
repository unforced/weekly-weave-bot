# Fixing Airtable Field Name Errors

## The Problem
You're getting an error like:
```
error: Unknown field name: "Title"
```

This happens when the field names in your Airtable base don't match what the bot expects.

## Quick Fix

### Step 1: Discover Your Actual Field Names
Run the debug script to see what fields your Airtable base actually has:

```bash
npx tsx scripts/debug-airtable.ts
```

This will show you:
- Which tables exist in your base
- The exact field names in each table
- Sample data if available

### Step 2: Update Field Mappings
Open `src/config/airtable-fields.ts` and update the field names to match your Airtable base.

For example, if your Airtable has:
- `Event Name` instead of `Title`
- `Start Date` instead of `Start Datetime`
- `Boulder Event` instead of `Is Boulder`

Update the mappings like this:

```typescript
export const AIRTABLE_FIELD_MAPPINGS = {
  events: {
    title: 'Event Name',           // Changed from 'Title'
    startDatetime: 'Start Date',   // Changed from 'Start Datetime'
    isBoulder: 'Boulder Event',    // Changed from 'Is Boulder'
    // ... other fields
  },
  // ... other tables
};
```

### Step 3: Test Your Changes
After updating the field mappings, test by submitting an event:
```
/event https://example.com/test-event
```

## Common Field Name Issues

1. **Spaces vs No Spaces**
   - Airtable: `Event Title`
   - Code expects: `Title`

2. **Different Naming Conventions**
   - Airtable: `One Liner` or `Oneliner`
   - Code expects: `One-liner`

3. **Boolean Fields**
   - Airtable: `Boulder` (checkbox)
   - Code expects: `Is Boulder`

4. **Date Fields**
   - Airtable: `Start` or `Event Date`
   - Code expects: `Start Datetime`

## Alternative: Rename Fields in Airtable

Instead of updating the code, you can rename your Airtable fields to match what the bot expects:

### Events Table
- Title
- Description
- Venue Name
- Location Address
- Start Datetime
- End Datetime
- Event Cost
- Tags
- Source Website
- Organizer Name
- Organizer Contact
- Is Boulder
- Category
- Is Recurring
- Registration Link

### Updates Table
- Content
- Summary
- One-liner
- Is Boulder
- Source Website
- Created At

### Content Table
- Content
- Summary
- One-liner
- Is Boulder
- Source Website
- Created At

### Errors Table
- Timestamp
- Command
- URL
- Error
- User ID
- Details

## Debugging Tips

1. **Check Permissions**: The "NOT_AUTHORIZED" error might mean:
   - Your API key doesn't have write access
   - The table/field is locked in Airtable
   - You're using a read-only API key

2. **Field Types**: Make sure field types match:
   - Dates should be Date fields
   - Is Boulder should be a Checkbox field
   - URLs should be URL or Text fields

3. **Required Fields**: The bot expects certain fields to exist. Create them in Airtable even if you don't use them all.

## Need More Help?

1. Check the Airtable API documentation for your base
2. Look at the exact error message - it usually shows which field is missing
3. Run the debug script again after making changes to verify