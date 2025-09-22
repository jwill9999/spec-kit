export type AgentKey =
  | 'claude'
  | 'cursor'
  | 'copilot'
  | 'opencode'
  | 'windsurf'
  | 'gemini'
  | 'qwen'
  | 'codex'
  | 'codex-cli';

export interface AgentInfo {
  path: string;
  format: 'md' | 'toml' | 'prompt.md';
}

export const agentDirs: Record<AgentKey, AgentInfo> = {
  claude: { path: '.claude/commands', format: 'md' },
  cursor: { path: '.cursor/commands', format: 'md' },
  copilot: { path: '.github/prompts', format: 'prompt.md' },
  opencode: { path: '.opencode/command', format: 'md' },
  windsurf: { path: '.windsurf/workflows', format: 'md' },
  gemini: { path: '.gemini/commands', format: 'toml' },
  qwen: { path: '.qwen/commands', format: 'toml' },
  codex: { path: '.codex/commands', format: 'md' },
  'codex-cli': { path: '.codex/commands', format: 'md' },
};

export function getAgentTarget(agent: unknown): AgentInfo | null {
  if (!agent) return null;
  const key = String(agent).toLowerCase() as AgentKey;
  return (agentDirs as Record<string, AgentInfo>)[key] || null;
}

export function isTomlAgent(agent: unknown): boolean {
  const key = String(agent || '').toLowerCase();
  return key === 'gemini' || key === 'qwen';
}
