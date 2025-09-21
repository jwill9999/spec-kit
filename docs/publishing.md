# Publishing to npm (beta)

This guide shows how to publish the CLI to npm as a prerelease (beta) and how to verify the result. You can publish manually from your machine or via the provided GitHub Actions workflow.

## Package details

- Package name: `@letuscode/spec-kit`
- Current prerelease version: `0.1.0-beta.0`
- CLI command: `specify` (from the `bin` mapping)
- Published files: `dist/`, `bin/specify.js`, `README.md`, `LICENSE`

## Prerequisites

- Node.js 20+
- npm account with publish rights on `@letuscode`
- Ensure the package builds and tests pass:

```bash
npm ci
npm run typecheck
npm run lint
npm run format:check
npm run build
npm test --silent
```

## Manual publish (recommended for now)

1. Authenticate to npm (scoped public packages):

```bash
npm login
# Or set an auth token in ~/.npmrc: //registry.npmjs.org/:_authToken=YOUR_TOKEN
```

2. Verify publish payload without uploading:

```bash
npm publish --tag beta --dry-run
```

3. Publish the prerelease to the `beta` dist-tag:

```bash
npm publish --tag beta --access public
```

Notes:

- The version should already be a prerelease (e.g., `0.1.0-beta.0`).
- `--access public` is required for public scoped packages.

## Verify on npm

```bash
npm view @letuscode/spec-kit versions --json
npm dist-tag ls @letuscode/spec-kit
```

## Install the beta globally

```bash
npm i -g @letuscode/spec-kit@beta
specify --help
```

## GitHub Actions workflow (optional)

We include a manual workflow to publish to npm:

- Workflow: `.github/workflows/release.yml` ("Publish Beta to npm")
- Trigger: Actions → Publish Beta to npm → Run workflow (preid defaults to `beta`)
- Steps performed: typecheck, lint, format check, build, test, prerelease bump (if needed), and publish

Before using the workflow:

- Add an `NPM_TOKEN` secret in the repository (Settings → Secrets and variables → Actions)
- Token must have `publish` permission on the `@letuscode` scope

## Post-publish tips

- Commit the version change (if you bumped locally) and push to `main`.
- If you rename package in the future, update README and consider deprecating the old name to direct users.
