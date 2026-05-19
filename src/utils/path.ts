import type { App } from "obsidian";

export function isMarkdownKey(key: string): boolean {
  return key.endsWith(".md");
}

export function getVaultPathForKey(remotePrefix: string, localFolder: string, key: string): string {
  const relativePath = remotePrefix ? key.slice(remotePrefix.length) : key;
  return joinVaultPath(localFolder, relativePath);
}

export async function ensureParentFolderExists(app: App, vaultPath: string): Promise<void> {
  const parentFolder = getParentFolder(vaultPath);
  if (!parentFolder) {
    return;
  }

  await ensureFolderExists(app, parentFolder);
}

function getParentFolder(vaultPath: string): string {
  const lastSlashIndex = vaultPath.lastIndexOf("/");
  return lastSlashIndex === -1 ? "" : vaultPath.slice(0, lastSlashIndex);
}

async function ensureFolderExists(app: App, folderPath: string): Promise<void> {
  if (await app.vault.adapter.exists(folderPath)) {
    return;
  }

  const parentFolder = getParentFolder(folderPath);
  if (parentFolder) {
    await ensureFolderExists(app, parentFolder);
  }

  try {
    await app.vault.adapter.mkdir(folderPath);
  } catch {
    if (!(await app.vault.adapter.exists(folderPath))) {
      throw new Error(`Failed to create folder: ${folderPath}`);
    }
  }
}

function joinVaultPath(...parts: string[]): string {
  return parts.filter((part) => part.length > 0).join("/");
}
