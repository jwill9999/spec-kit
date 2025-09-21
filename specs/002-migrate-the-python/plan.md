---
description: 'Implementation plan for migrating Specify CLI from Python to Node.js'
---

# Implementation Plan: Migrate Specify CLI from Python to Node.js

**Branch**: `002-migrate-the-python` | **Date**: 2025-09-20 | **Spec**: specs/002-migrate-the-python/spec.md
**Input**: Feature specification from `/specs/002-migrate-the-python/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (single CLI project)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

## Summary

Migrate the Specify CLI from Python to Node.js while preserving command behavior, JSON outputs, cross-platform support, and multi-agent template generation. Ensure feature parity for `init` and `check` commands, the 5-phase SDD workflow integration, and release packaging. Non-goals: changing the SDD workflow or agent directory conventions.

## Technical Context

**Language/Version**: Node.js 20 LTS
**Primary Dependencies**: commander (CLI), chalk (color), ora (progress), undici (HTTP), cross-spawn (process), picocolors/colorette alternative acceptable
**Storage**: None (no persistent state; local filesystem only)
**Testing**: vitest (or jest), tsup/esbuild for bundling if needed
**Target Platform**: Linux, macOS, Windows
**Project Type**: single (CLI tool)
**Performance Goals**: startup < 300ms p95; CLI operations responsive with clear progress
**Constraints**: <150MB RSS typical; offline-friendly where feasible; strict JSON output contract
**Scale/Scope**: Single binary/script distribution; repository-scoped operations

## Constitution Check

Gates determined from `/memory/constitution.md`:

- Spec-first: Spec exists and avoids HOW details → PASS
- 5-phase SDD workflow enforced (constitution → specify → plan → tasks → implement) → PASS
- Template-driven consistency maintained (same headings/sections; placeholders preserved) → PASS
- Multi-agent compatibility: keep directory conventions and argument placeholders (`$ARGUMENTS`, `{{args}}`, `{SCRIPT}`, `__AGENT__`) → PASS
- CLI-first: All operations exposed via CLI with JSON output for script integration → PASS
- Version management: Changes to CLI require version bump and changelog update → NOTE (to be enforced during tasks)

## Project Structure

### Documentation (this feature)

```
specs/002-migrate-the-python/
├── plan.md              # This file (/plan output)
├── research.md          # Phase 0 output (/plan)
├── data-model.md        # Phase 1 output (/plan)
├── quickstart.md        # Phase 1 output (/plan)
└── contracts/           # Phase 1 output (/plan)
```

### Source Code (repository root)

```
# Option 1: Single project (DEFAULT)
src/
├── cli/
├── services/
└── lib/

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: DEFAULT to Option 1 (single CLI project)

## Phase 0: Outline & Research

1. Extract unknowns from Technical Context:
   - Node version policy (LTS 20.x) → decide and document
   - CLI framework (commander vs oclif) → choose commander for smaller footprint
   - Packaging (npm + npx vs single binary via pkg) → decide
   - HTTP client (undici) + TLS/proxy behavior → align with truststore use cases
   - Cross-platform scripts (bash/PowerShell parity) → preserve current pattern
   - Testing framework (vitest) → decide and scaffold
   - Release workflow alignment (GitHub Actions) → update packaging steps

2. Generate research tasks (see research.md):
   - Best practices for Node CLI ergonomics, JSON outputs, error handling
   - Undici + proxy/trust store configuration
   - Cross-platform spawn, env handling, absolute paths

3. Consolidate findings in `research.md`.

## Phase 1: Design & Contracts

1. CLI contracts → `contracts/cli-spec.md`:
   - `specify init` args/options, JSON outputs, error codes
   - `specify check` tool checks and outputs
   - Environment variables (GH_TOKEN/GITHUB_TOKEN)

2. Data model (if any) → `data-model.md`:
   - No persistent domain entities; define runtime config objects and IO contracts only

3. Quickstart scenarios → `quickstart.md`:
   - Run `specify check`
   - Initialize a project with a chosen agent
   - Validate template files and directory structure

4. Contract tests plan:
   - One test per CLI command and JSON schema validation for outputs

## Phase 2: Task Planning Approach (for /tasks)

- Generate tasks from contracts and quickstart scenarios
- Mark parallel tasks [P] where files are independent (tests, separate modules)
- Enforce TDD: write contract/integration tests before implementation

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| None      | —          | —                                    |

## Progress Tracking

**Phase Status**:

- [x] Phase 0: Research planned (/plan)
- [x] Phase 1: Design planned (/plan)
- [x] Phase 2: Task planning described (/plan)
- [ ] Phase 3: Tasks generated (/tasks)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---

_Based on Constitution v1.0.0 - See `/memory/constitution.md`_
