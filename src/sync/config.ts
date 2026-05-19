import type { App } from "obsidian";
import type { PluginSettings } from "../settings";

const ACCESS_KEY_ID_SECRET_ID = "r2-sync-access-key-id";
const SECRET_ACCESS_KEY_SECRET_ID = "r2-sync-secret-access-key";

export type PluginSecrets = {
  accessKeyId: string;
  secretAccessKey: string;
};

export function getMissingConfiguration(app: App, settings: PluginSettings): string[] {
  const missing: string[] = [];

  if (!settings.accountId) {
    missing.push("account ID");
  }

  if (!settings.bucket) {
    missing.push("bucket");
  }

  if (!settings.remotePrefix) {
    missing.push("remote prefix");
  }

  if (!settings.localFolder) {
    missing.push("local folder");
  }

  const secrets = getPluginSecrets(app);
  if (!secrets?.accessKeyId) {
    missing.push("access key ID");
  }

  if (!secrets?.secretAccessKey) {
    missing.push("secret access key");
  }

  return missing;
}

export function getPluginSecrets(app: App): PluginSecrets | null {
  const accessKeyId = app.secretStorage.getSecret(ACCESS_KEY_ID_SECRET_ID)?.trim();
  const secretAccessKey = app.secretStorage.getSecret(SECRET_ACCESS_KEY_SECRET_ID)?.trim();

  if (!accessKeyId || !secretAccessKey) {
    return null;
  }

  return {
    accessKeyId,
    secretAccessKey,
  };
}

export function getStoredAccessKeyId(app: App): string {
  return app.secretStorage.getSecret(ACCESS_KEY_ID_SECRET_ID) ?? "";
}

export function getStoredSecretAccessKey(app: App): string {
  return app.secretStorage.getSecret(SECRET_ACCESS_KEY_SECRET_ID) ?? "";
}

export function saveAccessKeyId(app: App, value: string) {
  app.secretStorage.setSecret(ACCESS_KEY_ID_SECRET_ID, value.trim());
}

export function saveSecretAccessKey(app: App, value: string) {
  app.secretStorage.setSecret(SECRET_ACCESS_KEY_SECRET_ID, value.trim());
}
