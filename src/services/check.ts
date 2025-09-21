import { spawnSync } from 'node:child_process';
import { platform } from 'node:process';

function which(cmd: string) {
  const isWin = platform === 'win32';
  const finder = isWin ? 'where' : 'which';
  const res = spawnSync(finder, [cmd], { encoding: 'utf8' });
  return res.status === 0 ? res.stdout.trim() : null;
}

export interface CheckOptions {
  json?: boolean;
}

export async function runCheck(opts: CheckOptions) {
  const result = {
    git: { ok: !!which('git'), path: which('git') || undefined },
    claude: { ok: !!which('claude') },
    gemini: { ok: !!which('gemini') },
    'cursor-agent': { ok: !!which('cursor-agent') },
    qwen: { ok: !!which('qwen') },
    opencode: { ok: !!which('opencode') },
    windsurf: { ok: !!which('windsurf') },
  } as Record<string, unknown>;

  if (opts.json) {
    console.log(JSON.stringify(result));
  } else {
    console.log(result);
  }
}
