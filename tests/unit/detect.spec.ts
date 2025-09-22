import { describe, it, expect, vi } from 'vitest';

// Dynamic map to control which tools are found by mocked `which/where`
let found: Record<string, boolean> = {};

vi.mock('node:child_process', () => ({
  spawnSync(cmd: string, args: string[]) {
    if ((cmd === 'which' || cmd === 'where') && Array.isArray(args)) {
      const name = args[0];
      if (found[name]) return { status: 0, stdout: `/usr/bin/${name}\n` };
      return { status: 1, stdout: '' };
    }
    return { status: 0, stdout: 'v1.2.3\n' };
  },
}));

describe('detectTools', () => {
  it('returns ok flags for known tools and codex-cli fallback', async () => {
    found = {
      git: true,
      claude: false,
      gemini: true,
      'cursor-agent': false,
      qwen: true,
      opencode: false,
      windsurf: false,
      'codex-cli': false,
      codex: true,
    };
    const { detectTools } = await import('../../src/lib/detect');
    const res = await detectTools();
    expect(res.git.ok).toBe(true);
    expect(res.claude.ok).toBe(false);
    expect(res.gemini.ok).toBe(true);
    expect(res['cursor-agent'].ok).toBe(false);
    expect(res.qwen.ok).toBe(true);
    expect(res.opencode.ok).toBe(false);
    expect(res.windsurf.ok).toBe(false);
    expect(res['codex-cli'].ok).toBe(true);
    expect(res['codex-cli'].version).toBeTypeOf('string');
  });
});
