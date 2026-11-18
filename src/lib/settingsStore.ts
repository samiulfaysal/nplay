import fs from 'fs';
import path from 'path';
import { createServerSupabaseClient } from '@/utils/supabase/server';

export interface AppSettings {
  supabaseUrl: string;
  supabaseAnonKey: string;
  tmdbApiKey: string;
  adminEmail: string;
  adminPassword?: string;
  publicRegistration: boolean;
  serverVidsrc: string;
  serverAutoembed: string;
  serverTwoEmbed: string;
  serverCinejoy: string;
  serverFmovies: string;
  serverNet77: string;
  serverFlixora: string;
}

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

const DEFAULT_SETTINGS: AppSettings = {
  supabaseUrl:
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://tacbfwheoaqbhmyvxnsb.supabase.co',
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    'sb_publishable_EnNVv_mWFj7sMKzOtXdBBw_oDDFo4wD',
  tmdbApiKey:
    process.env.NEXT_PUBLIC_TMDB_API_KEY ||
    process.env.TMDB_API_KEY ||
    '',
  adminEmail: (process.env.ADMIN_EMAIL || 'admin@nplay.tv').trim().toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123456',
  publicRegistration: true,
  serverVidsrc: 'https://vidsrc.to/embed/{type}/{tmdbId}',
  serverAutoembed: 'https://multiembed.mov/?video_id={tmdbId}&tmdb=1',
  serverTwoEmbed: 'https://www.2embed.cc/embed/{tmdbId}',
  serverCinejoy: 'https://vidsrc.me/embed/{type}?tmdb={tmdbId}',
  serverFmovies: 'https://autoembed.co/{type}/tmdb/{tmdbId}',
  serverNet77: 'https://vidsrc.xyz/embed/{type}?tmdb={tmdbId}',
  serverFlixora: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
};

/**
 * Get all active settings (reading persistent local storage first, then checking Supabase)
 */
export async function getAppSettings(): Promise<AppSettings> {
  let fileSettings: Partial<AppSettings> = {};

  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      fileSettings = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[SettingsStore] Error reading local settings.json:', err);
  }

  // Check Supabase site_settings if available
  const dbSettings: Record<string, string> = {};
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.from('site_settings' as any).select('*');
    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        if (item?.key && item?.value !== undefined) {
          dbSettings[item.key] = item.value;
        }
      });
    }
  } catch {
    // Non-blocking fallback if database table not yet created
  }

  return {
    ...DEFAULT_SETTINGS,
    ...fileSettings,
    ...(dbSettings['PUBLIC_REGISTRATION_ENABLED'] !== undefined
      ? { publicRegistration: dbSettings['PUBLIC_REGISTRATION_ENABLED'] !== 'false' }
      : {}),
    ...(dbSettings['SERVER_VIDSRC_URL'] ? { serverVidsrc: dbSettings['SERVER_VIDSRC_URL'] } : {}),
    ...(dbSettings['SERVER_AUTOEMBED_URL'] ? { serverAutoembed: dbSettings['SERVER_AUTOEMBED_URL'] } : {}),
    ...(dbSettings['SERVER_2EMBED_URL'] ? { serverTwoEmbed: dbSettings['SERVER_2EMBED_URL'] } : {}),
    ...(dbSettings['SERVER_CINEJOY_URL'] ? { serverCinejoy: dbSettings['SERVER_CINEJOY_URL'] } : {}),
    ...(dbSettings['SERVER_FMOVIES_URL'] ? { serverFmovies: dbSettings['SERVER_FMOVIES_URL'] } : {}),
    ...(dbSettings['SERVER_NET77_URL'] ? { serverNet77: dbSettings['SERVER_NET77_URL'] } : {}),
    ...(dbSettings['SERVER_FLIXORA_URL'] ? { serverFlixora: dbSettings['SERVER_FLIXORA_URL'] } : {}),
    ...(dbSettings['ADMIN_EMAIL'] ? { adminEmail: dbSettings['ADMIN_EMAIL'] } : {}),
  };
}

/**
 * Save settings both to persistent local storage and Supabase
 */
export async function saveAppSettings(
  updates: Partial<AppSettings>
): Promise<AppSettings> {
  const current = await getAppSettings();
  const merged: AppSettings = {
    ...current,
    ...updates,
    publicRegistration:
      updates.publicRegistration !== undefined
        ? Boolean(updates.publicRegistration)
        : current.publicRegistration,
  };

  // 1. Write to local persistent file storage
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[SettingsStore] Error writing to settings.json:', err);
  }

  // 2. Sync to Supabase site_settings table (graceful background try)
  try {
    const supabase = await createServerSupabaseClient();
    const dbUpdates = [
      { key: 'PUBLIC_REGISTRATION_ENABLED', value: merged.publicRegistration ? 'true' : 'false' },
      { key: 'ADMIN_EMAIL', value: merged.adminEmail || '' },
      { key: 'SERVER_VIDSRC_URL', value: merged.serverVidsrc || '' },
      { key: 'SERVER_AUTOEMBED_URL', value: merged.serverAutoembed || '' },
      { key: 'SERVER_2EMBED_URL', value: merged.serverTwoEmbed || '' },
      { key: 'SERVER_CINEJOY_URL', value: merged.serverCinejoy || '' },
      { key: 'SERVER_FMOVIES_URL', value: merged.serverFmovies || '' },
      { key: 'SERVER_NET77_URL', value: merged.serverNet77 || '' },
      { key: 'SERVER_FLIXORA_URL', value: merged.serverFlixora || '' },
    ];

    for (const item of dbUpdates) {
      if (item.value) {
        await (supabase.from('site_settings' as any) as any)
          .upsert({
            key: item.key,
            value: item.value,
            updated_at: new Date().toISOString(),
          })
          .catch(() => {});
      }
    }
  } catch {
    // Non-blocking if table is not yet created
  }

  return merged;
}

/**
 * Fast synchronous check for public registration status
 */
export function isPublicRegistrationEnabledSync(): boolean {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && typeof data.publicRegistration === 'boolean') {
        return data.publicRegistration;
      }
    }
  } catch {}
  return true;
}
