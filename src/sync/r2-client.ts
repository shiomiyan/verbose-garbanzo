import { S3Client } from "@aws-sdk/client-s3";
import type { PluginSecrets } from "./config";

export function createR2Client(accountId: string, secrets: PluginSecrets): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: secrets.accessKeyId,
      secretAccessKey: secrets.secretAccessKey,
    },
  });
}
