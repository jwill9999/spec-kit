<div align="center">
<img src="assets/img/logo_small.png" width="200" />
  <h1>Node Spec-Kit </h1>
  <p><em>Spec-Driven Development, made simple with Node.</em></p>
  
  <p>
    <a href="https://github.com/jwill9999/spec-kit/actions/workflows/node-ci.yml">
      <img alt="CI Status" src="https://github.com/jwill9999/spec-kit/actions/workflows/node-ci.yml/badge.svg" />
    </a>
    <a href="https://codecov.io/gh/jwill9999/spec-kit" >
      <img alt="Coverage" src="https://codecov.io/gh/jwill9999/spec-kit/branch/main/graph/badge.svg?token=" />
    </a>
    <a href="https://www.npmjs.com/package/@letuscode/spec-kit">
      <img alt="npm (scoped)" src="https://img.shields.io/npm/v/%40letuscode%2Fspec-kit.svg?label=npm%20latest" />
    </a>
    <a href="https://www.npmjs.com/package/@letuscode/spec-kit">
      <img alt="npm beta" src="https://img.shields.io/npm/v/%40letuscode%2Fspec-kit/beta.svg?label=npm%20beta" />
    </a>
  </p>
</div>

---

> ## Disclaimer
>
> This Spec Kit is a fork of GitHub's original repository [spec-kit](https://github.com/github/spec-kit.git.)\
> It has been modified to use Node and npm.\
> It uses a simple interactive setup wizard.\
> Fork maintained by [@jwill9999](https://github.com/jwill9999).

## Overview

Spec Kit helps you build software from specifications, not code-first. Start a project with a short guided wizard and get agent-ready commands plus a clean structure for writing specs, plans, and tasks.

## Requirements

- macOS/Linux/Windows
- Node.js 20+
- Git

## Quick start

### Installation

```bash
npm install -g @letuscode/spec-kit
```

### Initialize a new project

```bash
speckit
```

This launches a simple, interactive wizard. It asks for a project name and your preferred AI assistant, then lays down the right command templates and scripts.

Tip: You can also run `speckit --help` to see all available options.

## What it generates

Depending on the AI assistant you pick, the wizard creates agent-specific command files under the right folders, for example:

- .claude/commands/
- .github/prompts/
- .cursor/commands/
- .qwen/commands/
- .opencode/command/
- .windsurf/workflows/

It also includes cross-platform helper scripts under scripts/ and prepares a space for your specifications (see specs/ when you start a feature).

## Workflow at a glance

Spec-Driven Development follows a simple five-step flow you’ll run inside your AI assistant:

- /constitution → set project principles
- /specify → write the feature spec (what/why)
- /plan → design the technical approach
- /tasks → break down implementation
- /implement → build according to the plan

Read more in spec-driven.md for the detailed methodology.

## Troubleshooting

- Ensure Node 20+ and Git are installed and on PATH.
- If your terminal is very narrow, the wizard uses a compact view automatically.
- The wizard remembers your last choices in .specify/wizard.json (repo-local). Delete it to reset.

## License

MIT — see LICENSE for details.
