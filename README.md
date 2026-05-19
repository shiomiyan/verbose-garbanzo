# r2-sync

`r2-sync` is an Obsidian plugin starter repository for future plugin development.

It keeps the runtime surface intentionally small:

- one command
- one settings tab
- one modal

The plugin behavior is still generic on purpose. This repository is meant to be the clean starting point for a future `r2-sync` implementation.

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
git tag v0.1.0
git push origin v0.1.0
```

## Next Things To Customize

Before turning this starter into the real plugin, update:

- plugin name and ID if needed
- plugin description
- sample command name and behavior
- default setting value
- modal title and body text
