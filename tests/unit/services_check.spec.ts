/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mutable map controlling which tools are "found" by mocked `which`
let found: Record<string, boolean> = {};

// Mock child_process used by services/check.ts's internal `which()` helper
vi.mock('node:child_process', () => ({
  spawnSync(cmd: string, args: string[]) {
    // Handle both Unix 'which' and Windows 'where'
    if ((cmd === 'which' || cmd === 'where') && Array.isArray(args)) {
      const name = args[0];
      if (found[name]) {
        const path =
          process.platform === 'win32'
            ? `C:\\Program Files\\${name}\\${name}.exe`
            : `/usr/bin/${name}`;
        return { status: 0, stdout: `${path}\n` };
      }
      return { status: 1, stdout: '' };
    }
    return { status: 0, stdout: '' };
  },
}));

describe('services/runCheck', () => {
  let logSpy: any;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('prints JSON with ok flags based on which()', async () => {
    found = {
      git: true,
      claude: false,
      gemini: true,
      'cursor-agent': false,
      qwen: false,
      opencode: true,
      windsurf: false,
    };
    const { runCheck } = await import('../../src/services/check.ts');
    await runCheck({ json: true });
    expect(logSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse((logSpy.mock.calls[0][0] as string) ?? '{}');
    expect(payload.git.ok).toBe(true);
    expect(payload.claude.ok).toBe(false);
    expect(payload.gemini.ok).toBe(true);
    expect(payload['cursor-agent'].ok).toBe(false);
    expect(payload.qwen.ok).toBe(false);
    expect(payload.opencode.ok).toBe(true);
    expect(payload.windsurf.ok).toBe(false);
    // when ok, path is provided for git
    expect(payload.git.path).toBeTypeOf('string');
  });

  it('prints object (non-JSON) when json flag is omitted', async () => {
    found = { git: true };
    const { runCheck } = await import('../../src/services/check.ts');
    await runCheck({});
    expect(logSpy).toHaveBeenCalledTimes(1);
    const firstArg = logSpy.mock.calls[0][0] as any;
    expect(typeof firstArg).toBe('object');
    expect(firstArg.git.ok).toBe(true);
  });
});
