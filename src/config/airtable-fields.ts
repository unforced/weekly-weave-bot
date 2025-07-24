// Airtable field mappings
// Update these to match your actual Airtable field names

export const AIRTABLE_FIELD_MAPPINGS = {
  // Events table fields
  events: {
    title: 'Title',              // Change to 'Event Title' or 'Name' if different
    description: 'Description',
    venueName: 'Venue Name',
    locationAddress: 'Location Address',
    startDatetime: 'Start Datetime',
    endDatetime: 'End Datetime',
    eventCost: 'Event Cost',
    tags: 'Tags',
    sourceWebsite: 'Source Website',
    organizerName: 'Organizer Name',
    organizerContact: 'Organizer Contact',
    isBoulder: 'Is Boulder',
    category: 'Category',
    isRecurring: 'Is Recurring',
    registrationLink: 'Registration Link',
  },
  
  // Updates table fields
  updates: {
    content: 'Content',
    summary: 'Summary',
    oneLiner: 'One-liner',      // Might be 'One Liner' or 'Oneliner'
    isBoulder: 'Is Boulder',
    sourceWebsite: 'Source Website',
    createdAt: 'Created At',
  },
  
  // Content table fields
  content: {
    content: 'Content',
    summary: 'Summary',
    oneLiner: 'One-liner',       // Might be 'One Liner' or 'Oneliner'
    isBoulder: 'Is Boulder',
    sourceWebsite: 'Source Website',
    createdAt: 'Created At',
  },
  
  // Errors table fields
  errors: {
    timestamp: 'Timestamp',
    command: 'Command',
    url: 'URL',
    error: 'Error',
    userId: 'User ID',
    details: 'Details',
  },
  
  // System fields (usually auto-created by Airtable)
  system: {
    created: 'Created',          // Might be 'Created Time' or 'createdTime'
  }
};

// Common alternative field names to try
export const FIELD_ALTERNATIVES = {
  'Title': ['Event Title', 'Name', 'Event Name', 'title'],
  'One-liner': ['One Liner', 'Oneliner', 'One-Liner', 'OneLiner'],
  'Is Boulder': ['Boulder', 'IsBoulder', 'is_boulder', 'In Boulder'],
  'Created At': ['Created', 'Created Time', 'createdTime', 'CreatedAt'],
  'Start Datetime': ['Start Date', 'Start Time', 'Start', 'Event Date'],
  'End Datetime': ['End Date', 'End Time', 'End'],
};

// Helper function to get field name with fallbacks
export function getFieldName(table: keyof typeof AIRTABLE_FIELD_MAPPINGS, field: string): string {
  const mapping = AIRTABLE_FIELD_MAPPINGS[table];
  return (mapping as any)[field] || field;
}