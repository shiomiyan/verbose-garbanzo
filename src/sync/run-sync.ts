import { GetObjectCommand, ListObjectsV2Command, type S3Client } from "@aws-sdk/client-s3";
import type { App } from "obsidian";
import type { PluginSettings, PluginState } from "../settings";
import { mapLimit } from "../utils/concurrency";
import { ensureParentFolderExists, getVaultPathForKey, isMarkdownKey } from "../utils/path";
import type { PluginSecrets } from "./config";
import { createR2Client } from "./r2-client";

export type SyncStats = {
  scanned: number;
  downloaded: number;
  skipped: number;
  failed: number;
};

export type RunR2SyncParams = {
  app: App;
  settings: PluginSettings;
  state: PluginState;
  secrets: PluginSecrets;
};

export type RunR2SyncResult = {
  nextLastProcessedKey: string | undefined;
  stats: SyncStats;
};

type FileSyncOutcome = "downloaded" | "skipped" | "failed";

export async function runR2Sync({
  app,
  settings,
  state,
  secrets,
}: RunR2SyncParams): Promise<RunR2SyncResult> {
  const client = createR2Client(settings.accountId, secrets);
  const stats: SyncStats = {
    scanned: 0,
    downloaded: 0,
    skipped: 0,
    failed: 0,
  };

  let continuationToken: string | undefined;
  let maxProcessedKey = state.lastProcessedKey;
  let hadFailure = false;
  let usedStartAfter = false;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: settings.bucket,
        Prefix: settings.remotePrefix,
        StartAfter: !usedStartAfter ? state.lastProcessedKey : undefined,
        ContinuationToken: continuationToken,
      }),
    );
    usedStartAfter = true;

    const pageKeys = (response.Contents ?? [])
      .map((item) => item.Key)
      .filter((key): key is string => typeof key === "string")
      .filter((key) => isMarkdownKey(key));

    stats.scanned += pageKeys.length;

    if (pageKeys.length > 0) {
      const pageMaxKey = [...pageKeys].sort().at(-1);
      if (pageMaxKey && (!maxProcessedKey || pageMaxKey > maxProcessedKey)) {
        maxProcessedKey = pageMaxKey;
      }
    }

    const outcomes = await mapLimit(pageKeys, settings.maxConcurrentDownloads, async (key) =>
      syncSingleFile(app, client, settings, key),
    );

    for (const outcome of outcomes) {
      if (outcome === "downloaded") {
        stats.downloaded += 1;
      } else if (outcome === "skipped") {
        stats.skipped += 1;
      } else {
        stats.failed += 1;
        hadFailure = true;
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return {
    nextLastProcessedKey: hadFailure ? state.lastProcessedKey : maxProcessedKey,
    stats,
  };
}

async function syncSingleFile(
  app: App,
  client: S3Client,
  settings: PluginSettings,
  key: string,
): Promise<FileSyncOutcome> {
  try {
    const localPath = getVaultPathForKey(settings.remotePrefix, settings.localFolder, key);

    if (await app.vault.adapter.exists(localPath)) {
      return "skipped";
    }

    await ensureParentFolderExists(app, localPath);

    const response = await client.send(
      new GetObjectCommand({
        Bucket: settings.bucket,
        Key: key,
      }),
    );

    const body = response.Body;
    if (!body) {
      return "failed";
    }

    const content = await body.transformToString();
    await app.vault.adapter.write(localPath, content);
    return "downloaded";
  } catch {
    return "failed";
  }
}
