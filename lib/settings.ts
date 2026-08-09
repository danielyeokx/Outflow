import * as FileSystem from 'expo-file-system/legacy';

const SETTINGS_PATH = FileSystem.documentDirectory + 'settings.json';

import { ColorTheme } from "./theme";

export type AppSettings = {
  defaultCurrency: string;
  staticKeywordsEnabled: boolean;
  colorTheme: ColorTheme;
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
};

const DEFAULTS: AppSettings = { defaultCurrency: 'SGD', staticKeywordsEnabled: true, colorTheme: 'neutral', weekStartsOn: 0 };

export async function readSettings(): Promise<AppSettings> {
  try {
    const json = await FileSystem.readAsStringAsync(SETTINGS_PATH);
    return { ...DEFAULTS, ...JSON.parse(json) };
  } catch {
    return DEFAULTS;
  }
}

export async function writeSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const current = await readSettings();
  const next = { ...current, ...patch };
  await FileSystem.writeAsStringAsync(SETTINGS_PATH, JSON.stringify(next));
  return next;
}
