import { supabase } from './supabase';

export async function getSiteSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .single();
  
  if (error || !data) {
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
}
