import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, rmSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync, type SpawnSyncReturns } from 'node:child_process';

function runIn(dir: string, args: ReadonlyArray<string>): SpawnSyncReturns<string> {
  return spawnSync('node', [path.resolve(process.cwd(), 'bin/speckit.js'), ...args], {
    cwd: dir,
    encoding: 'utf8',
  });
}

describe('init for claude', () => {
  let tmp: string;
  beforeAll(() => {
    tmp = mkdtempSync(path.join(tmpdir(), 'spec-kit-'));
  });
  afterAll(() => {
    try {
      rmSync(tmp, { recursive: true, force: true });
    } catch (_e) {
      /* noop cleanup */
    }
  });

  it('creates agent command templates under .claude/commands when --here', () => {
    const out = runIn(tmp, ['init', '--ai', 'claude', '--here', '--json']);
    expect(out.status).toBe(0);
    const obj = JSON.parse(out.stdout) as { templates?: string[] };
    expect(obj).toHaveProperty('templates');
    expect(Array.isArray(obj.templates)).toBe(true);
    const commandsDir = path.join(tmp, '.claude', 'commands');
    const entries = readdirSync(commandsDir);
    expect(entries.length).toBeGreaterThan(0);
    for (const f of entries) {
      const st = statSync(path.join(commandsDir, f));
      expect(st.isFile()).toBe(true);
    }
  });
});
