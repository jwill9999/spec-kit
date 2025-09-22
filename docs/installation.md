# Installation Guide

## Prerequisites

- **Node.js 20+** and npm
- **Linux/macOS/Windows** (cross-platform support)
- AI coding agent: [Claude Code](https://www.anthropic.com/claude-code), [GitHub Copilot](https://code.visualstudio.com/), [Gemini CLI](https://github.com/google-gemini/gemini-cli), [Cursor](https://cursor.sh/), [Qwen Code](https://github.com/QwenLM/Qwen), [opencode](https://github.com/opencodeinterpreter/opencode), or [Windsurf](https://windsurf.com/)
- [Git](https://git-scm.com/downloads)

## Installation

### Global Installation (Recommended)

Install the Spec Kit CLI globally via npm:

```bash
npm install -g @letuscode/spec-kit
```

### Initialize a New Project

After installation, simply run:

```bash
speckit
```

This launches the interactive wizard that will guide you through project setup.

### Command Options

You can also use specific commands directly:

```bash
# Run the interactive wizard
speckit

# Initialize in current directory
speckit init --here

# Initialize with specific AI agent
speckit init --ai claude
speckit init --ai gemini
speckit init --ai copilot
speckit init --ai cursor
speckit init --ai qwen
speckit init --ai opencode
speckit init --ai windsurf

# Check prerequisites
speckit check

# Show help
speckit --help
```

## Verification

After installation and initialization, you should see the following commands available in your AI agent:

- `/constitution` - Set project principles
- `/specify` - Create specifications
- `/plan` - Generate implementation plans
- `/tasks` - Break down into actionable tasks
- `/implement` - Build according to the plan

The project directory will contain both `.sh` and `.ps1` scripts for cross-platform compatibility.

## Troubleshooting

### Permission Issues

If you encounter permission issues after `npm link` during development:

```bash
chmod +x bin/speckit
chmod +x bin/speckit.js
```

### Node.js Version

Ensure you're using Node.js 20 or higher:

```bash
node --version
```

### Git Configuration

Make sure Git is properly configured:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```
