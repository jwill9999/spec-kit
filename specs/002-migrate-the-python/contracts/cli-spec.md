# CLI Contract: Specify (Node.js)

## Command: specify check

- Description: Validate availability of required/optional tools.
- Input: flags
  - `--json` (boolean): print machine-readable output.
- Output (JSON):

```
{
  "git": { "ok": true, "path": "/usr/bin/git" },
  "claude": { "ok": false },
  "gemini": { "ok": true, "version": "..." },
  "cursor-agent": { "ok": false },
  "qwen": { "ok": false },
  "opencode": { "ok": false },
  "windsurf": { "ok": false }
}
```

- Exit Codes:
  - 0: Completed (may include warnings for optional tools)
  - 1: Fatal error

## Command: specify init

- Description: Initialize a new Specify project.
- Args: `[project-name]`
- Options:
  - `--ai <agent>`: claude|gemini|copilot|cursor|qwen|opencode|windsurf
  - `--script <sh|ps>`
  - `--ignore-agent-tools` (boolean)
  - `--no-git` (boolean)
  - `--here` (boolean)
  - `--skip-tls` (boolean)
  - `--debug` (boolean)
  - `--github-token <token>`
- Output (JSON):

```
{
  "projectDir": "/abs/path",
  "agent": "claude",
  "scripts": { "sh": "...", "ps": "..." },
  "templates": ["/abs/path/templates/..."],
  "notes": ["..."]
}
```

- Exit Codes:
  - 0: Success
  - 2: Validation error (e.g., invalid agent)
  - 1: Fatal error

## Environment

- GH_TOKEN/GITHUB_TOKEN: used for GitHub API calls when provided
- Proxy/TLS: honor standard Node env (HTTP(S)\_PROXY, NODE_EXTRA_CA_CERTS)
