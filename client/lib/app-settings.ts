import { toast } from "sonner";
import type { AppSettings } from "@shared/types";
import { getDefaultSettings, mergeWithDefaults } from "@shared/utils/settings";

const SETTINGS_KEY = "rehber360:settings";

export type { AppSettings };

export function defaultSettings(): AppSettings {
  return getDefaultSettings();
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const response = await fetch('/api/settings');
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    const parsed = await response.json() as Partial<AppSettings>;
    return mergeWithDefaults(parsed);
  } catch (error) {
    console.error('Error loading settings:', error);
    toast.error('Ayarlar yüklenirken hata oluştu');
    return defaultSettings();
  }
}

export async function saveSettings(v: AppSettings): Promise<void> {
  try {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(v)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save settings');
    }
    
    toast.success('Ayarlar kaydedildi');
  } catch (error) {
    console.error('Error saving settings:', error);
    toast.error('Ayarlar kaydedilemedi');
    throw error;
  }
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<void> {
  const cur = await loadSettings();
  const next: AppSettings = {
    ...cur,
    ...patch,
    notifications: { ...cur.notifications, ...(patch.notifications || {}) },
    privacy: { ...cur.privacy, ...(patch.privacy || {}) },
    account: { ...cur.account, ...(patch.account || {}) },
  };
  await saveSettings(next);
}

export { SETTINGS_KEY };
