import { spawnSync } from 'node:child_process';

function checkCmd(cmd: string): boolean {
  const isWin = process.platform === 'win32';
  const which = isWin ? 'where' : 'which';
  const out = spawnSync(which, [cmd], { stdio: 'ignore' });
  return out.status === 0;
}

function getVersion(cmd: string, args: string[] = ['--version']): string | undefined {
  try {
    const out = spawnSync(cmd, args, { encoding: 'utf8' });
    if (out.status === 0) {
      return (out.stdout || out.stderr || '').toString().trim().split(/\r?\n/)[0];
    }
  } catch {
    // ignore detection errors
  }
  return undefined;
}

export interface ToolInfo {
  ok: boolean;
  version?: string;
}
export type ToolMap = Record<string, ToolInfo>;

export async function detectTools(): Promise<ToolMap> {
  const tools = ['git', 'claude', 'gemini', 'cursor-agent', 'qwen', 'opencode', 'windsurf'];
  const result: ToolMap = {};
  for (const t of tools) {
    const ok = checkCmd(t);
    result[t] = ok ? { ok, version: getVersion(t) } : { ok };
  }
  // Handle codex-cli with fallback to 'codex' binary
  const hasCodexCli = checkCmd('codex-cli') || checkCmd('codex');
  result['codex-cli'] = hasCodexCli
    ? { ok: true, version: getVersion('codex-cli') || getVersion('codex') }
    : { ok: false };

  // Detect GitHub Copilot CLI: either standalone 'copilot' binary or 'gh copilot' extension
  const hasCopilotBin = checkCmd('copilot');
  let hasGhCopilot = false;
  try {
    const out = spawnSync('gh', ['copilot', '--help'], { stdio: 'ignore' });
    hasGhCopilot = out.status === 0;
  } catch {
    // ignore
  }

  let copilotVersion: string | undefined;
  if (hasCopilotBin) {
    copilotVersion = getVersion('copilot');
  } else if (hasGhCopilot) {
    // Try to parse version from gh extension list
    try {
      const list = spawnSync('gh', ['extension', 'list'], { encoding: 'utf8' });
      if (list.status === 0) {
        const line = (list.stdout || '').split(/\r?\n/).find((l) => /copilot-cli/i.test(l));
        if (line) {
          // common format: github/copilot-cli vX.Y.Z
          const m = line.match(/copilot-cli\s+v?([\w\.-]+)/i);
          if (m) copilotVersion = m[1];
        }
      }
    } catch {
      // ignore
    }
  }
  result['copilot'] =
    hasCopilotBin || hasGhCopilot ? { ok: true, version: copilotVersion } : { ok: false };
  return result;
}
