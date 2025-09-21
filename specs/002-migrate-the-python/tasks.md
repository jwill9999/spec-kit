# Tasks: Migrate Specify CLI from Python to Node.js

**Input**: Design documents from `/specs/002-migrate-the-python/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory
2. Load optional design documents
3. Generate tasks by category (Setup, Tests, Core, Integration, Polish)
4. Apply TDD order and [P] rules
5. Number tasks (T001..)
6. Create dependency graph
```

## Format: `[ID] [P?] Description`

## Phase 3.1: Setup

- [ ] T001 Create Node project: package.json with name "specify-cli", engines.node ">=20", type module
- [ ] T002 Add dependencies: commander, undici, picocolors, ora, cross-spawn; devDeps: vitest, tsx, tsup (optional), eslint, typescript (optional)
- [ ] T003 [P] Scaffold source layout: src/cli/main.ts, src/services/, src/lib/
- [ ] T004 [P] Configure scripts: check, init, build, test in package.json
- [ ] T005 Configure linting/formatting (eslint + tsconfig) (optional per plan)

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

- [ ] T006 [P] Contract test for `specify check --json` output shape in tests/contract/check.spec.ts
- [ ] T007 [P] Contract test for `specify init --json` output shape in tests/contract/init.spec.ts
- [ ] T008 [P] Integration test: initialize project for agent (claude) in tests/integration/init_claude.spec.ts
- [ ] T009 [P] Integration test: directory structure validation in tests/integration/structure.spec.ts

## Phase 3.3: Core Implementation

- [ ] T010 Implement CLI entrypoint: bin/specify -> src/cli/main.ts
- [ ] T011 Implement `check` command: tool detection, JSON output
- [ ] T012 Implement `init` command: project bootstrap, agent templates, absolute paths
- [ ] T013 Error handling & JSON error envelope
- [ ] T014 Logging/progress: disable with --json

## Phase 3.4: Integration

- [ ] T015 Cross-platform script execution: preserve bash/PowerShell scripts
- [ ] T016 HTTP client wrapper with undici and proxy/TLS env support
- [ ] T017 Release packaging: npm publish flow; prepare agent ZIP pipeline parity

## Phase 3.5: Polish

- [ ] T018 [P] Update docs: README quickstart for Node CLI
- [ ] T019 [P] Add CHANGELOG entry and bump version
- [ ] T020 CI updates: add Node workflow and adjust release jobs
- [ ] T021 [P] Add JSON schema(s) for CLI outputs and validate in tests
- [ ] T022 Remove dead code and align naming with Python CLI parity

## Dependencies

- T006–T009 before T010–T014
- T010 blocks T011–T014
- T011/T012 before T015–T017
- Docs/CI (T018–T020) after core features

## Parallel Example

```
# Launch T006–T009 together
npx vitest tests/contract/check.spec.ts
npx vitest tests/contract/init.spec.ts
npx vitest tests/integration/init_claude.spec.ts
npx vitest tests/integration/structure.spec.ts
```

## Validation Checklist

- [ ] All contracts have corresponding tests
- [ ] Tests precede implementation (TDD)
- [ ] Parallel tasks operate on separate files
- [ ] CLI outputs conform to documented JSON shapes
- [ ] Version bump + changelog complete
