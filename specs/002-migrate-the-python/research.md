# Research: Migrate Specify CLI to Node.js

## Decisions to Make

- Node version policy: Use Node.js 20 LTS (active LTS). Document engines in package.json.
- CLI framework: commander for minimal footprint and maturity.
- Packaging strategy: npm distribution first; optional single-binary via `pkg` later.
- HTTP client: undici with retry/backoff; TLS/proxy support via environment and Node trust store.
- Interactive UX: inquirer/prompts for selections; keep JSON mode for automation.
- Logging/UX: chalk/picocolors + ora for progress; respect `--json` to disable spinners and color.
- Cross-platform: use cross-spawn and absolute paths; preserve bash/PowerShell scripts.
- Testing: vitest + tsx; contract tests for CLI JSON outputs.
- Release: GitHub Actions to build/publish npm package and agent-specific ZIPs; parity with current pipeline.

## Rationale

- Smaller dependency surface vs oclif; commander is enough.
- undici is standard, performant HTTP client in Node 18+.
- npm-first reduces friction for users; single-binary can come later.

## Decisions (resolved)

- Installation: Support both global install (`npm i -g specify-cli`) and on-demand runs (`npx specify`). Recommendation: prefer `npx` in docs for zero-install.
- Trust store/TLS: Rely on Node defaults and document `NODE_EXTRA_CA_CERTS` for corporate roots; respect `HTTPS_PROXY`/`HTTP_PROXY` envs.

## References

- Node.js 20 LTS release notes
- undici docs (proxy/agent)
- commander, inquirer/prompts
