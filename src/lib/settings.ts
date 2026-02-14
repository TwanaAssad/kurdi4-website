import { db } from './db';
import { siteSettings } from './schema';

export async function getSiteSettings() {
  try {
    const data = await db.query.siteSettings.findFirst();
    
    if (!data) {
      return {
        primary_color: '#563a4a',
        secondary_color: '#c29181',
        accent_color: '#f0ecee',
        social_facebook: '',
        social_tiktok: '',
        social_instagram: '',
        social_linkedin: '',
        social_youtube: '',
        available_languages: ['ku'],
        default_language: 'ku'
      };
    }
    
    return data;
  } catch (error) {
    return {
      primary_color: '#563a4a',
      secondary_color: '#c29181',
      accent_color: '#f0ecee',
      social_facebook: '',
      social_tiktok: '',
      social_instagram: '',
      social_linkedin: '',
      social_youtube: '',
      available_languages: ['ku'],
      default_language: 'ku'
    };
  }
}

