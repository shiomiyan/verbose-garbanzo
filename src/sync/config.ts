import type { App } from "obsidian";
import type { PluginSettings } from "../settings";

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

  const secrets = getPluginSecrets(app, settings);
  if (!secrets?.accessKeyId) {
    missing.push("access key ID");
  }

  if (!secrets?.secretAccessKey) {
    missing.push("secret access key");
  }

  return missing;
}

export function getPluginSecrets(app: App, settings: PluginSettings): PluginSecrets | null {
  const accessKeyId = app.secretStorage.getSecret(settings.accessKeyIdSecretName)?.trim() ?? "";
  const secretAccessKey = app.secretStorage.getSecret(settings.secretAccessKeySecretName)?.trim() ?? "";

  if (!accessKeyId || !secretAccessKey) {
    return null;
  }

  return {
    accessKeyId,
    secretAccessKey,
  };
}

export function getStoredAccessKeyIdSecretName(settings: PluginSettings): string {
  return settings.accessKeyIdSecretName;
}

export function getStoredSecretAccessKeySecretName(settings: PluginSettings): string {
  return settings.secretAccessKeySecretName;
}
