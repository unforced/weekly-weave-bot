import * as cheerio from 'cheerio';

export function extractStructuredData(html: string): Record<string, any> {
  const $ = cheerio.load(html);
  let structuredData: Record<string, any> = {};
  
  // Extract JSON-LD structured data
  const scripts = $('script[type="application/ld+json"]');
  
  for (let i = 0; i < scripts.length; i++) {
    try {
      const element = scripts[i];
      const jsonText = $(element).text().trim();
      
      if (jsonText) {
        const data = JSON.parse(jsonText);
        
        // If we have an array, merge all objects
        if (Array.isArray(data)) {
          data.forEach(item => {
            if (item['@type'] === 'Event' || item.startDate) {
              // Prefer event data
              structuredData = { ...structuredData, ...item };
            } else {
              Object.assign(structuredData, item);
            }
          });
        } else {
          // Single object
          if (data['@type'] === 'Event' || data.startDate) {
            // Prefer event data
            structuredData = { ...structuredData, ...data };
          } else {
            Object.assign(structuredData, data);
          }
        }
      }
    } catch (e) {
      // Ignore parsing errors silently
    }
  }
  
  return structuredData;
}