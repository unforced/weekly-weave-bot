import { NewsletterTemplate } from '../../interfaces/newsletter.interface.js';

export const oaklandReviewTemplate: NewsletterTemplate = {
  name: 'oakland-review',
  description: 'Oakland Review of Books style - conversational with editorial asides',
  
  header: `
    <div class="header">
      <h1>{{title}}</h1>
      <p class="subtitle">Your curated guide to what's happening {{metadata.location}} this week</p>
      {{#if metadata.introduction}}
        <div class="introduction">{{metadata.introduction}}</div>
      {{/if}}
    </div>
  `,
  
  dayGroupFormat: `
    <div class="day-section">
      <h2 class="day-header">{{dateFormatted}}</h2>
    </div>
  `,
  
  eventFormat: `
    <div class="event-item">
      <p class="event-content">
        <strong><a href="{{sourceWebsite}}" class="event-link">{{title}}</a></strong>
        {{#if eventCost}}
          <span class="cost-note">({{eventCost}})</span>
        {{/if}}
        - {{time}}{{#if endTime}} to {{endTime}}{{/if}}
        {{#if venueName}}
          at {{venueName}}{{#if locationAddress}}, {{locationAddress}}{{/if}}
        {{/if}}.
        {{#if description}}
          <span class="event-note">{{description}}</span>
        {{/if}}
        {{#if category}}
          <span class="category-badge category-{{category}}">{{category}}</span>
        {{/if}}
      </p>
    </div>
  `,
  
  updateFormat: `
    <div class="update-item">
      <p><strong>{{oneLiner}}</strong> - {{summary}} 
      <a href="{{sourceWebsite}}" class="read-more">Check it out</a>.</p>
    </div>
  `,
  
  contentFormat: `
    <div class="content-item">
      <p><strong>{{oneLiner}}</strong> - {{summary}} 
      <a href="{{sourceWebsite}}" class="read-more">Read more</a>.</p>
    </div>
  `,
  
  footer: `
    <footer>
      {{#if metadata.conclusion}}
        <div class="conclusion">
          <p>{{metadata.conclusion}}</p>
        </div>
      {{/if}}
      <div class="sign-off">
        <p>-Your Newsletter Bot</p>
      </div>
    </footer>
  `,
  
  styles: `
    body {
      font-family: Georgia, 'Times New Roman', serif;
      line-height: 1.8;
      color: #333;
      background: #fefefe;
      margin: 0;
      padding: 0;
      font-size: 16px;
    }
    
    .newsletter-container {
      max-width: 700px;
      margin: 0 auto;
      padding: 30px 40px;
      background: white;
    }
    
    .header {
      margin-bottom: 40px;
      border-bottom: 3px double #ddd;
      padding-bottom: 30px;
    }
    
    h1 {
      font-size: 2.2em;
      margin-bottom: 10px;
      font-weight: normal;
      color: #1a1a1a;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    
    .subtitle {
      font-size: 1.1em;
      color: #666;
      font-style: italic;
      margin-bottom: 20px;
    }
    
    .introduction {
      font-size: 1.05em;
      line-height: 1.8;
      color: #444;
      margin-top: 20px;
    }
    
    h2 {
      font-size: 1.5em;
      margin-top: 35px;
      margin-bottom: 20px;
      color: #2c2c2c;
      font-weight: bold;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    
    .event-item, .update-item, .content-item {
      margin-bottom: 20px;
      font-size: 1em;
      line-height: 1.8;
    }
    
    .event-link {
      color: #0066cc;
      text-decoration: none;
      border-bottom: 1px solid #cce0ff;
    }
    
    .event-link:hover {
      color: #0052a3;
      border-bottom-color: #0066cc;
    }
    
    .cost-note {
      color: #666;
      font-size: 0.95em;
    }
    
    .event-note {
      color: #555;
      font-style: italic;
    }
    
    .category-badge {
      display: inline-block;
      font-size: 0.8em;
      padding: 2px 8px;
      border-radius: 3px;
      margin-left: 8px;
      text-transform: lowercase;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    
    .category-literary {
      background: #e8f4fd;
      color: #1976d2;
    }
    
    .category-cultural {
      background: #fce4ec;
      color: #c2185b;
    }
    
    .category-music {
      background: #f3e5f5;
      color: #7b1fa2;
    }
    
    .category-activist {
      background: #e8f5e9;
      color: #388e3c;
    }
    
    .category-tech {
      background: #e3f2fd;
      color: #1565c0;
    }
    
    .category-community {
      background: #fff3e0;
      color: #e65100;
    }
    
    .category-other {
      background: #f5f5f5;
      color: #616161;
    }
    
    .read-more {
      color: #0066cc;
      text-decoration: none;
      font-style: italic;
    }
    
    .read-more:hover {
      text-decoration: underline;
    }
    
    footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 3px double #ddd;
    }
    
    .conclusion {
      font-size: 1.05em;
      line-height: 1.8;
      color: #444;
      margin-bottom: 30px;
    }
    
    .sign-off {
      text-align: right;
      font-style: italic;
      color: #666;
      font-size: 1.1em;
    }
    
    @media (max-width: 600px) {
      .newsletter-container {
        padding: 20px;
      }
      
      h1 {
        font-size: 1.8em;
      }
      
      body {
        font-size: 15px;
      }
    }
  `
};