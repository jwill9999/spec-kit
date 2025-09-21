<!--
SYNC IMPACT REPORT - Constitution Update
==========================================

Version Change: INITIAL → 1.0.0 (Initial constitution creation)

Principle Additions:
- I. Specification-First Development: Establishes requirement for testable, business-focused specifications
- II. Multi-Agent AI Support: Defines support for 7 AI agents with consistent workflow
- III. Structured Development Workflow: Enforces 5-phase SDD process (constitution→specify→plan→tasks→implement)
- IV. Template-Driven Consistency: Requires standardized templates across all agents
- V. CLI-First Tool Design: Mandates command-line interface as primary interaction method

New Sections Added:
- Development Standards: Quality requirements for version management, documentation, testing
- Multi-Agent Integration Requirements: Specific patterns for agent integration
- Governance: Constitutional compliance and amendment procedures

Templates Requiring Updates:
✅ /templates/plan-template.md (constitution version reference updated v2.1.1 → v1.0.0)
✅ /templates/spec-template.md (already aligned with Specification-First principle)
✅ /templates/tasks-template.md (already aligned with Structured Workflow principle)
✅ /templates/commands/*.md (already reference constitution dynamically)

Follow-up TODOs:
- None - all placeholders resolved and templates synchronized

Constitutional Compliance:
- All templates validated against new principles
- Multi-agent support patterns documented and enforced
- 5-phase workflow structure preserved in all command templates
- CLI-first design maintained in tool architecture
-->

# Spec Kit Constitution

## Core Principles

### I. Specification-First Development

Every feature begins with a clear, testable specification before any implementation. Specifications MUST be written for business stakeholders, not developers. Focus on WHAT users need and WHY, never HOW to implement. All specifications MUST be testable, unambiguous, and contain measurable success criteria. No implementation details (languages, frameworks, APIs) are permitted in specifications.

### II. Multi-Agent AI Support

The toolkit MUST support multiple AI coding assistants while maintaining consistent project structure. Each supported agent (Claude, Gemini, Copilot, Cursor, Qwen, opencode, Windsurf) gets agent-specific templates and directory structures. Cross-platform compatibility is mandatory with dual bash/PowerShell script support. All agent integrations MUST follow the same 5-phase SDD workflow: constitution → specify → plan → tasks → implement.

### III. Structured Development Workflow (NON-NEGOTIABLE)

The 5-phase Spec-Driven Development workflow is strictly enforced: `/constitution` → `/specify` → `/plan` → `/tasks` → `/implement`. Each phase has explicit gates and dependencies. No phase can be skipped. Each command MUST validate prerequisites before proceeding. Progress tracking is mandatory at each phase. Templates and scripts enforce the workflow structure automatically.

### IV. Template-Driven Consistency

All project artifacts are generated from standardized templates. Templates MUST be synchronized across all supported agents. Template placeholders use consistent naming conventions (`[ALL_CAPS_IDENTIFIER]`). Version compatibility between templates is mandatory. Agent-specific adaptations preserve core template structure while accommodating agent conventions (Markdown vs TOML formats, argument patterns).

### V. CLI-First Tool Design

The Specify CLI is the primary interface for Spec Kit functionality. All operations MUST be accessible via command-line interface. JSON output format enables script automation and integration. Cross-platform support (Linux, macOS, Windows) is required. Tool availability checks are performed for agent-specific CLIs. The CLI provides rich, interactive feedback with progress tracking and error reporting.

## Development Standards

All Spec Kit components MUST follow these quality standards:

- **Version Management**: Any changes to CLI require version increment in pyproject.toml and CHANGELOG.md entries
- **Documentation**: All supported agents documented in AGENTS.md with integration patterns
- **Testing**: New agent support requires validation across all command templates
- **Error Handling**: Rich error messages with actionable guidance for users
- **Performance**: Template processing and script execution optimized for developer workflow efficiency

## Multi-Agent Integration Requirements

Agent integration follows strict patterns to ensure consistency:

- **Directory Conventions**: Each agent has specific directory structure (`.claude/commands/`, `.github/prompts/`, etc.)
- **Command Formats**: Support for both Markdown and TOML formats based on agent preferences
- **Argument Patterns**: Consistent placeholder replacement (`$ARGUMENTS`, `{{args}}`, `{SCRIPT}`)
- **Context Management**: Agent-specific context files updated incrementally, preserving manual additions
- **Release Pipeline**: Automated agent-specific package generation and validation

## Governance

This constitution supersedes all other development practices within Spec Kit. All feature development, agent integration, and toolkit modifications MUST comply with these principles. Constitution violations require explicit justification and approval. Amendments follow semantic versioning: MAJOR for principle changes, MINOR for new sections, PATCH for clarifications.

All pull requests MUST verify constitutional compliance. New agent support MUST demonstrate adherence to structured workflow principles. Template changes require validation across all supported agents. Complexity must be justified - prefer simplicity and YAGNI principles.

**Version**: 1.0.0 | **Ratified**: 2025-09-20 | **Last Amended**: 2025-09-20
