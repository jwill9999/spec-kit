import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

function runIn(dir, args) {
  return spawnSync('node', [path.resolve(process.cwd(), 'bin/specify.js'), ...args], {
    cwd: dir,
    encoding: 'utf8',
  });
}

describe('generated structure', () => {
  let tmp;
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

  it('reports absolute script paths and projectDir in JSON', () => {
    const out = runIn(tmp, ['init', 'demo', '--ai', 'claude', '--json']);
    expect(out.status).toBe(0);
    const obj = JSON.parse(out.stdout);
    expect(path.isAbsolute(obj.projectDir)).toBe(true);
    expect(path.isAbsolute(obj.scripts.sh)).toBe(true);
    expect(path.isAbsolute(obj.scripts.ps)).toBe(true);
  });
});
