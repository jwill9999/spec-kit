/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('services/runInit', () => {
  let logSpy: any;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('prints JSON with projectDir and agent when json flag is set', async () => {
    const { runInit } = await import('../../src/services/init.ts');
    await runInit('my-proj', { ai: 'claude', json: true });
    expect(logSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse((logSpy.mock.calls[0][0] as string) ?? '{}');
    expect(payload).toHaveProperty('projectDir');
    expect(payload.agent).toBe('claude');
    expect(payload.scripts).toBeDefined();
  });

  it('prints object (non-JSON) when json flag is omitted', async () => {
    const { runInit } = await import('../../src/services/init.ts');
    await runInit(undefined, { ai: null });
    expect(logSpy).toHaveBeenCalledTimes(1);
    const firstArg = logSpy.mock.calls[0][0] as any;
    expect(typeof firstArg).toBe('object');
    expect(firstArg).toHaveProperty('projectDir');
  });
});
