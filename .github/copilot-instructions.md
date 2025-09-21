# GitHub Copilot Instructions for Spec Kit

## Project Overview

**Spec Kit** is a Python CLI tool implementing **Spec-Driven Development (SDD)** methodology. The project creates project templates and AI agent integrations that enable structured software development through specifications rather than code-first approaches.

### Core Architecture

- **CLI Tool**: Python 3.11+ using Typer, Rich, and httpx in `src/specify_cli/__init__.py`
- **Multi-Agent Support**: 7+ AI agents (Claude, Gemini, Copilot, Cursor, Qwen, opencode, Windsurf)
- **Template System**: Markdown-based command templates in `templates/commands/`
- **Script Automation**: Dual bash/PowerShell scripts for cross-platform support
- **Release Pipeline**: Automated GitHub Actions generating agent-specific packages

## Spec-Driven Development Workflow

The SDD methodology follows a strict 5-phase command sequence:

```
/constitution → /specify → /plan → /tasks → /implement
```

### Command Flow Pattern

Each command in `templates/commands/` follows this structure:

1. **Frontmatter**: Metadata with description and platform-specific scripts
2. **Script Execution**: Run bash/PowerShell helper with JSON output parsing
3. **Template Processing**: Load templates, populate with feature context
4. **File Generation**: Create specs, plans, tasks in `specs/###-feature-name/`
5. **Validation**: Gate checks before proceeding to next phase

### Critical File Patterns

**Feature Structure** (created by `/specify`):

```
specs/001-feature-name/
├── spec.md              # Requirements and user stories (no tech details)
├── plan.md              # Technical architecture (/plan output)
├── tasks.md             # Implementation breakdown (/tasks output)
├── research.md          # Technology research
├── data-model.md        # Entity definitions
├── quickstart.md        # Integration test scenarios
└── contracts/           # API specifications
```

**Branch Naming**: Feature branches follow `###-feature-name` format (3-digit prefix)

## Development Conventions

### Adding New AI Agent Support

When adding support for new AI agents (reference: `AGENTS.md`):

1. **Update Constants**: Add to `AI_CHOICES` in `__init__.py`
2. **Release Pipeline**: Update `create-release-packages.sh` with agent case
3. **Context Scripts**: Add agent file handling to both bash/PowerShell scripts
4. **Directory Conventions**: Follow patterns (`.claude/commands/`, `.github/prompts/`, etc.)
5. **Format Patterns**: Markdown vs TOML, argument placeholders (`$ARGUMENTS` vs `{{args}}`)

### CLI Architecture Patterns

**Command Structure**:

- `init`: Bootstrap projects with agent-specific templates
- `check`: Validate tool availability across agents
- Interactive selection using arrow keys and Rich Live display
- Cross-platform script generation (bash/PowerShell duality)

**Error Handling**:

- Typer for CLI with custom BannerGroup showing ASCII art
- Rich Console for formatted output and progress tracking
- StepTracker for hierarchical progress visualization

### Script Development Guidelines

**Dual-Platform Scripts** (`scripts/bash/` and `scripts/powershell/`):

- Always maintain feature parity between bash and PowerShell versions
- Use JSON output for structured data exchange with Python CLI
- Common functions in `common.sh`/`common.ps1` for reusability
- Git branch and file path validation in all feature scripts

**Key Script Functions**:

- `create-new-feature.sh`: Branch creation, directory setup, template copying
- `check-*-prerequisites.sh`: Feature context validation
- `update-agent-context.sh`: Incremental agent file updates

### Template System

**Command Templates** follow this pattern:

```markdown
---
description: 'Command purpose'
scripts:
  sh: scripts/bash/script-name.sh --json "{ARGS}"
  ps: scripts/powershell/script-name.ps1 -Json "{ARGS}"
---

Command instructions with {SCRIPT} and $ARGUMENTS placeholders
```

**Template Substitution**:

- `{SCRIPT}`: Platform-appropriate script path
- `$ARGUMENTS`/`{{args}}`: User input (format varies by agent)
- `__AGENT__`: Agent type for context files

## Critical Implementation Details

### Version Management

- **Required**: Update `project.toml` version for any `__init__.py` changes
- **Required**: Add entries to `CHANGELOG.md` for version increments
- Uses semantic versioning and automated release pipeline

### Agent Context Updates

- Context files (`.claude/CLAUDE.md`, `.github/copilot-instructions.md`, etc.) are updated incrementally
- Preserve manual additions between script-generated markers
- Keep files under 150 lines for token efficiency
- Update only NEW technology choices, preserve existing content

### HTTP Client Configuration

- Uses `truststore` for SSL context with corporate proxy support
- Supports GitHub token authentication via CLI or environment variables
- Implements retry logic and detailed error reporting for GitHub API calls

## Testing and Validation

### CLI Testing Patterns

- Interactive testing with `specify init --ai <agent>`
- Validation of generated directory structures and command files
- Cross-platform script execution testing (bash/PowerShell)

### Release Validation

- Package creation script generates agent-specific ZIP files
- Template extraction and validation for all supported agents
- GitHub Actions integration with automated release pipeline

## Common Pitfalls

1. **Missing Script Updates**: Both bash and PowerShell scripts must be updated together
2. **CLI Tool Assumptions**: Only add CLI checks for agents that actually have command-line tools (not IDE-based agents like Copilot/Windsurf)
3. **Argument Format Mismatches**: Use correct placeholder format for each agent type
4. **Path Handling**: Always use absolute paths in script outputs; handle current directory vs new project directory scenarios
5. **Version Synchronization**: Don't forget to update version numbers and changelog for CLI changes

## Integration Points

### GitHub Actions

- Release workflow creates agent-specific packages automatically
- Documentation deployment via `docs.yml`
- Package validation and distribution through GitHub Releases

### AI Agent Compatibility

- Each agent has specific directory conventions and command formats
- Template generation adapts to agent-specific patterns
- Context file management preserves agent-specific customizations

---

_This file is generated by analyzing the Spec Kit codebase patterns and should be updated when major architectural changes occur._
