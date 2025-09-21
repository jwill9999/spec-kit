/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Track which binaries are "found" by the mocked which()
let found: Record<string, boolean> = {};
let spawnMock: any;

// Mock node:child_process to control `which` results and observe calls
vi.mock('node:child_process', () => {
  spawnMock = vi.fn((cmd: string, args: string[], _opts?: unknown) => {
    if ((cmd === 'which' || cmd === 'where') && Array.isArray(args)) {
      const name = args[0];
      if (found[name]) {
        return { status: 0, stdout: `/usr/local/bin/${name}\n` };
      }
      return { status: 1, stdout: '' };
    }
    return { status: 0, stdout: '' };
  });
  return { spawnSync: spawnMock };
});

describe('services/runCheck (edge cases)', () => {
  let logSpy: any;

  beforeEach(() => {
    found = {};
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('sets ok=false for all when no tools are found and omits git.path', async () => {
    const { runCheck } = await import('../../src/services/check.ts');
    await runCheck({ json: true });
    expect(logSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse((logSpy.mock.calls[0][0] as string) ?? '{}');

    // Every key should have ok === false
    for (const key of Object.keys(payload)) {
      expect(payload[key].ok).toBe(false);
    }
    // git.path should be undefined when git is not found
    expect(payload.git.path).toBeUndefined();
  });

  it('trims which() stdout for git.path and checks expected binaries', async () => {
    found = { git: true, gemini: true };
    const { runCheck } = await import('../../src/services/check.ts');
    await runCheck({ json: true });
    const payload = JSON.parse((logSpy.mock.calls[0][0] as string) ?? '{}');

    expect(payload.git.ok).toBe(true);
    expect(payload.git.path).toBe('/usr/local/bin/git'); // newline trimmed
    expect(payload.gemini.ok).toBe(true);

    // spawnSync called with which for at least these binaries
    // Accept either which (Unix) or where (Windows)
    expect(
      spawnMock.mock.calls.some(
        (c: any[]) => (c[0] === 'which' || c[0] === 'where') && c[1]?.[0] === 'git'
      )
    ).toBe(true);
    expect(
      spawnMock.mock.calls.some(
        (c: any[]) => (c[0] === 'which' || c[0] === 'where') && c[1]?.[0] === 'gemini'
      )
    ).toBe(true);
  });
});
