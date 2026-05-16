import * as FileSystem from 'expo-file-system/legacy';

const SETTINGS_PATH = FileSystem.documentDirectory + 'settings.json';

export type AppSettings = {
  defaultCurrency: string;
  staticKeywordsEnabled: boolean;
};

const DEFAULTS: AppSettings = { defaultCurrency: 'SGD', staticKeywordsEnabled: true };

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
