import OpenAI from 'openai';
import { z } from 'zod';
import { EventData, UpdateData, ContentData } from '../interfaces/storage.interface.js';
import { WebPageData } from '../types/index.js';
import { loadConfig } from '../utils/config.js';
import { logger } from '../utils/logger.js';

const EventSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  venueName: z.string().optional(),
  locationAddress: z.string().optional(),
  startDatetime: z.string(),
  endDatetime: z.string().optional(),
  eventCost: z.string().optional(),
  tags: z.array(z.string()).optional(),
  organizerName: z.string().optional(),
  organizerContact: z.string().optional(),
  isBoulder: z.boolean(),
});

const UpdateSchema = z.object({
  content: z.string(),
  summary: z.string(),
  oneLiner: z.string().max(100),
  isBoulder: z.boolean(),
});

const ContentSchema = z.object({
  content: z.string(),
  summary: z.string(),
  oneLiner: z.string().max(100),
  isBoulder: z.boolean(),
});

export class AIExtractor {
  private openai: OpenAI;
  
  constructor() {
    const config = loadConfig();
    this.openai = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
    });
  }
  
  async extractEvent(pageData: WebPageData): Promise<EventData> {
    const systemPrompt = `You are an expert at extracting event information from web pages. 
Extract structured event data from the provided content. Be careful not to hallucinate information that isn't present.
If the page shows "Loading..." or minimal content, rely heavily on the Title and Description fields which often contain meta tag information.

CRITICAL DATE HANDLING RULES:
- Today's date is ${new Date().toISOString().split('T')[0]} (${new Date().toLocaleDateString('en-US', { weekday: 'long' })})
- For recurring weekly events without specific dates, if the event time hasn't passed today, use TODAY's date
- If only a time is mentioned (like "7:00pm" or "8:00pm") with no date, and it's a weekly event, assume it's TODAY if the time hasn't passed
- NEVER use dates from 2023 or 2024 - always use 2025 or later
- If the description mentions "Weekly" without a specific day, and has an evening time, assume it's happening today
- Current time is ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}

Determine if the event is in Boulder, Colorado based on location information.
Format dates as ISO 8601 strings.
Return your response as a JSON object.`;

    const userPrompt = `Extract event information from this page:
URL: ${pageData.url}
Title: ${pageData.title}
Description: ${pageData.description}
${pageData.structuredData ? `Structured Data: ${JSON.stringify(pageData.structuredData, null, 2)}` : ''}
Content: ${pageData.text}

IMPORTANT: 
1. Use the structured data for accurate dates and times when available.
2. If the page content is just "Loading..." or similar, extract information from the Title and Description fields which often contain Open Graph meta tag data.
3. The Title field may contain the actual event name (not "App").
4. Look for location information in the Description.
5. For weekly recurring events, if today is ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}, calculate the next occurrence appropriately.

Return JSON with these fields (skip missing fields):
- title: string (event title - extract from Title field if page shows "Loading...")
- description: string (optional)
- venueName: string (optional)
- locationAddress: string (optional)
- startDatetime: string (ISO 8601 format, required - for weekly events without dates, use next occurrence)
- endDatetime: string (ISO 8601 format, optional)
- eventCost: string (optional)
- tags: string[] (optional)
- organizerName: string (optional)
- organizerContact: string (optional)
- isBoulder: boolean (true if in Boulder, Colorado)`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });
      
      const content = response.choices[0].message.content;
      if (!content) throw new Error('No response from AI');
      
      const parsed = JSON.parse(content);
      const validated = EventSchema.parse(parsed);
      
      return {
        ...validated,
        startDatetime: new Date(validated.startDatetime),
        endDatetime: validated.endDatetime ? new Date(validated.endDatetime) : undefined,
        sourceWebsite: pageData.url,
      };
    } catch (error) {
      logger.error('Error extracting event:', error);
      throw new Error('Failed to extract event information');
    }
  }
  
  async extractUpdate(pageData: WebPageData): Promise<UpdateData> {
    const systemPrompt = `You are an expert at extracting key updates from web pages.
Extract the main update or announcement from the content.
Create a one-paragraph summary and a one-liner (max 15 words).
Determine if the update is related to Boulder, Colorado.
Return your response as a JSON object.`;

    const userPrompt = `Extract update information from this page:
URL: ${pageData.url}
Title: ${pageData.title}
Description: ${pageData.description}
Content: ${pageData.text}

Return JSON with these exact fields:
- content: string (the relevant information from the page)
- summary: string (one paragraph summary)
- oneLiner: string (max 15 words)
- isBoulder: boolean (true if related to Boulder, Colorado)`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });
      
      const content = response.choices[0].message.content;
      if (!content) throw new Error('No response from AI');
      
      const parsed = JSON.parse(content);
      const validated = UpdateSchema.parse(parsed);
      
      return {
        ...validated,
        sourceWebsite: pageData.url,
      };
    } catch (error) {
      logger.error('Error extracting update:', error);
      throw new Error('Failed to extract update information');
    }
  }
  
  async extractContent(pageData: WebPageData): Promise<ContentData> {
    const systemPrompt = `You are an expert at extracting key insights from articles and content.
Extract the main points and create a summary.
Create a one-paragraph summary and a one-liner (max 15 words).
Determine if the content is related to Boulder, Colorado.
Return your response as a JSON object.`;

    const userPrompt = `Extract content information from this page:
URL: ${pageData.url}
Title: ${pageData.title}
Description: ${pageData.description}
Content: ${pageData.text}

Return JSON with these exact fields:
- content: string (the main content/insights from the page)
- summary: string (one paragraph summary)
- oneLiner: string (max 15 words)
- isBoulder: boolean (true if related to Boulder, Colorado)`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });
      
      const content = response.choices[0].message.content;
      if (!content) throw new Error('No response from AI');
      
      const parsed = JSON.parse(content);
      const validated = ContentSchema.parse(parsed);
      
      return {
        ...validated,
        sourceWebsite: pageData.url,
      };
    } catch (error) {
      logger.error('Error extracting content:', error);
      throw new Error('Failed to extract content information');
    }
  }
}