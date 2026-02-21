import { db } from './db';
import { siteSettings } from './schema';

const defaultSettings = {
  org_name: 'زانست و پەروەردەی کوردی',
  logo_url: '',
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

export async function getSiteSettings() {
  try {
    const result = await db.select().from(siteSettings).limit(1);
    const settings = result[0] ?? defaultSettings;
    
    // Ensure available_languages is an array
    if (settings && typeof settings.available_languages === 'string') {
      try {
        settings.available_languages = JSON.parse(settings.available_languages);
      } catch (e) {
        settings.available_languages = ['ku'];
      }
    }

    if (settings && !Array.isArray(settings.available_languages)) {
      settings.available_languages = ['ku'];
    }
    
    return settings;
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return defaultSettings;
  }
}
