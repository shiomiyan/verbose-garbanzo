import type { Plugin } from "obsidian";

export type PluginSettings = {
  accountId: string;
  accessKeyIdSecretName: string;
  secretAccessKeySecretName: string;
  bucket: string;
  remotePrefix: string;
  localFolder: string;
  syncIntervalMinutes: number;
  maxConcurrentDownloads: number;
};

export type PluginState = {
  lastProcessedKey?: string;
};

export type PersistedData = {
  settings: PluginSettings;
  state: PluginState;
};

export const DEFAULT_SETTINGS: PluginSettings = {
  accountId: "",
  accessKeyIdSecretName: "",
  secretAccessKeySecretName: "",
  bucket: "",
  remotePrefix: "clippings/",
  localFolder: "Clippings",
  syncIntervalMinutes: 1,
  maxConcurrentDownloads: 5,
};

export function normalizeRemotePrefix(value: string): string {
  const trimmed = value.trim().replace(/^\/+/, "").replace(/\/+$/, "");
  return trimmed.length > 0 ? `${trimmed}/` : "";
}

export function normalizeLocalFolder(value: string): string {
  return value.trim().replace(/^\/+/, "").replace(/\/+$/, "");
}

export function normalizeSettings(settings: PluginSettings): PluginSettings {
  return {
    accountId: settings.accountId.trim(),
    accessKeyIdSecretName: settings.accessKeyIdSecretName.trim(),
    secretAccessKeySecretName: settings.secretAccessKeySecretName.trim(),
    bucket: settings.bucket.trim(),
    remotePrefix: normalizeRemotePrefix(settings.remotePrefix),
    localFolder: normalizeLocalFolder(settings.localFolder),
    syncIntervalMinutes: normalizeInteger(settings.syncIntervalMinutes, 0),
    maxConcurrentDownloads: normalizeInteger(settings.maxConcurrentDownloads, 1),
  };
}

export function normalizePersistedData(data: PersistedData): PersistedData {
  return {
    settings: normalizeSettings({
      ...DEFAULT_SETTINGS,
      ...data.settings,
    }),
    state: normalizeState(data.state),
  };
}

export async function loadPersistedData(plugin: Plugin): Promise<PersistedData> {
  const data = ((await plugin.loadData()) ?? {}) as Partial<PersistedData>;

  return normalizePersistedData({
    settings: {
      ...DEFAULT_SETTINGS,
      ...(data.settings ?? {}),
    },
    state: data.state ?? {},
  });
}

export async function savePersistedData(
  plugin: Plugin,
  settings: PluginSettings,
  state: PluginState,
): Promise<void> {
  await plugin.saveData(
    normalizePersistedData({
      settings,
      state,
    }),
  );
}

function normalizeState(state: PluginState): PluginState {
  const trimmed = state.lastProcessedKey?.trim();
  return trimmed ? { lastProcessedKey: trimmed } : {};
}

function normalizeInteger(value: number, minimum: number): number {
  const nextValue = Number.isFinite(value) ? Math.trunc(value) : minimum;
  return Math.max(minimum, nextValue);
}
