import { NewsletterTemplate } from '../../interfaces/newsletter.interface.js';

export const defaultTemplate: NewsletterTemplate = {
  name: 'default',
  description: 'Clean, simple newsletter format',
  
  header: `
    <h1>{{title}}</h1>
    <p class="date-range">{{dateFormatted}}</p>
    {{#if metadata.introduction}}
      <div class="introduction">{{metadata.introduction}}</div>
    {{/if}}
  `,
  
  dayGroupFormat: `
    <h2 class="day-header">{{dateFormatted}}</h2>
  `,
  
  eventFormat: `
    <div class="event">
      <h3><a href="{{sourceWebsite}}">{{title}}</a></h3>
      <div class="event-details">
        <span class="event-time">{{time}}{{#if endTime}} - {{endTime}}{{/if}}</span>
        {{#if venueName}}
          <span class="event-location"> @ {{venueName}}</span>
        {{/if}}
        {{#if eventCost}}
          <span class="event-cost"> • {{eventCost}}</span>
        {{/if}}
      </div>
      {{#if description}}
        <p class="event-description">{{description}}</p>
      {{/if}}
      {{#if tags}}
        <div class="event-tags">
          {{#each tags}}
            <span class="tag">{{this}}</span>
          {{/each}}
        </div>
      {{/if}}
    </div>
  `,
  
  updateFormat: `
    <div class="update">
      <h4>{{oneLiner}}</h4>
      <p>{{summary}}</p>
      <a href="{{sourceWebsite}}">Read more →</a>
    </div>
  `,
  
  contentFormat: `
    <div class="content-item">
      <h4>{{oneLiner}}</h4>
      <p>{{summary}}</p>
      <a href="{{sourceWebsite}}">View content →</a>
    </div>
  `,
  
  footer: `
    <footer>
      {{#if metadata.conclusion}}
        <div class="conclusion">{{metadata.conclusion}}</div>
      {{/if}}
      <p class="generated">Generated on {{generatedAt}}</p>
    </footer>
  `,
  
  styles: `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #2c3e50;
      background: #f5f7fa;
      margin: 0;
      padding: 0;
    }
    
    .newsletter-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    h1 {
      color: #2c3e50;
      margin-bottom: 10px;
      font-size: 2.5em;
    }
    
    h2 {
      color: #34495e;
      margin-top: 40px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #ecf0f1;
    }
    
    h3 {
      color: #2c3e50;
      margin-bottom: 10px;
    }
    
    a {
      color: #3498db;
      text-decoration: none;
    }
    
    a:hover {
      text-decoration: underline;
    }
    
    .date-range {
      color: #7f8c8d;
      font-size: 1.2em;
      margin-bottom: 20px;
    }
    
    .introduction, .conclusion {
      background: #ecf0f1;
      padding: 20px;
      border-radius: 5px;
      margin: 20px 0;
      font-style: italic;
    }
    
    .event {
      margin-bottom: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #3498db;
    }
    
    .event-details {
      color: #7f8c8d;
      margin: 10px 0;
      font-size: 0.95em;
    }
    
    .event-time {
      font-weight: bold;
    }
    
    .event-location {
      font-style: italic;
    }
    
    .event-description {
      margin-top: 10px;
      color: #555;
    }
    
    .event-tags {
      margin-top: 10px;
    }
    
    .tag {
      display: inline-block;
      background: #3498db;
      color: white;
      padding: 3px 10px;
      border-radius: 15px;
      font-size: 0.85em;
      margin-right: 5px;
    }
    
    .update, .content-item {
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 5px;
    }
    
    footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #ecf0f1;
      text-align: center;
      color: #7f8c8d;
    }
    
    .generated {
      font-size: 0.85em;
      color: #95a5a6;
    }
  `
};