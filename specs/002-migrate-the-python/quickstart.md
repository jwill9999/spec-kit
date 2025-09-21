# Quickstart Scenarios (Validation)

## Scenario 1: Run environment check

- Given Node.js 20 LTS is installed
- When I run `specify check --json`
- Then I see JSON with tool availability (git, claude, gemini, cursor-agent, qwen, opencode, windsurf)

## Scenario 2: Initialize a project for an agent

- When I run `specify init my-project --ai claude --here --ignore-agent-tools --json`
- Then the command exits with code 0 and prints JSON with created paths and agent files

## Scenario 3: Validate generated structure

- Then the project contains the expected directories and template files per AGENTS.md

## Scenario 4: SDD commands are discoverable

- Then the agent-specific command files exist and include /constitution, /specify, /plan, /tasks, /implement
