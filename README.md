# r2-sync

`r2-sync` is a read-only Obsidian plugin that syncs Markdown files from Cloudflare R2 into your vault without overwriting existing notes.

The plugin is intentionally narrow:

- Cloudflare R2 only
- Markdown files only
- existing local files are always skipped
- credentials are stored with Obsidian secret storage

## Behavior

- The command **Sync from R2 now** runs an immediate sync.
- The plugin also runs one background sync on load when configuration is complete.
- Periodic sync is controlled by `syncIntervalMinutes`.
- Setting `syncIntervalMinutes` to `0` disables periodic sync after startup.
- Synced files are written under the configured local folder, preserving the path relative to the configured R2 prefix.

Example:

```text
R2 key:    clippings/2026-05-16-1554-7261fb0.md
Vault file: Clippings/2026-05-16-1554-7261fb0.md
```

## Configuration

Normal settings are stored in plugin data:

- `accountId`
- `bucket`
- `remotePrefix`
- `localFolder`
- `syncIntervalMinutes`
- `maxConcurrentDownloads`
- `lastProcessedKey`

Secrets are stored with Obsidian secret storage:

- `accessKeyIdSecretName`
- `secretAccessKeySecretName`

The plugin is read-only against R2. It does not upload, modify, or delete remote objects.

## Development

This project uses:

- `pnpm`
- `TypeScript`
- `Rolldown`
- `Oxlint`
- `Oxfmt`

Requirements:

- Node.js `24+`

Install dependencies:

```bash
pnpm install
```

Run the development build in watch mode:

```bash
pnpm run dev
```

Run quality checks:

```bash
pnpm run typecheck
pnpm run lint
pnpm run fmt:check
pnpm run build
```

## Output Files

Release artifacts are emitted at the repository root:

- `main.js`
- `manifest.json`
- `styles.css`

Copy those files into:

```text
.obsidian/plugins/r2-sync/
```

## Release Flow

This repository includes GitHub Actions for CI and releases.

- CI runs on pushes and pull requests.
- Releases run when a tag matching `v*` is pushed.
- The release workflow uploads `main.js`, `manifest.json`, and `styles.css` to the GitHub Release.

Example:

```bash
git tag 0.1.0
git push origin 0.1.0
```
