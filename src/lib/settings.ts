import { db } from './db';
import { sql } from 'drizzle-orm';

const defaultSettings = {
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
    const result = await db.execute(sql.raw(`SELECT * FROM site_settings LIMIT 1`)) as any;
    const rows = Array.isArray(result) ? (Array.isArray(result[0]) ? result[0] : result) : (result?.rows ?? []);
    return rows[0] ?? defaultSettings;
  } catch (error) {
    return defaultSettings;
  }
}

