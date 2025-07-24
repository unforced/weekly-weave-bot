import { NewsletterTemplate } from '../../interfaces/newsletter.interface.js';
import { defaultTemplate } from './default-template.js';
import { oaklandReviewTemplate } from './oakland-review-template.js';

export const templates: Record<string, NewsletterTemplate> = {
  default: defaultTemplate,
  'oakland-review': oaklandReviewTemplate
};

export { defaultTemplate, oaklandReviewTemplate };