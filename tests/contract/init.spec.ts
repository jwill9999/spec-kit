import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

describe('specify init --json', () => {
  it('prints JSON with keys', () => {
    const tempCwd = mkdtempSync(path.join(tmpdir(), 'spec-kit-'));
    const bin = path.resolve(process.cwd(), 'bin/specify.js');
    try {
      const { status, stdout } = spawnSync(
        'node',
        [bin, 'init', 'tmp-proj', '--ai', 'claude', '--json'],
        {
          encoding: 'utf8',
          cwd: tempCwd,
        }
      );
      expect(status).toBe(0);
      const obj = JSON.parse(stdout);
      expect(obj).toHaveProperty('projectDir');
      expect(obj).toHaveProperty('agent');
    } finally {
      rmSync(tempCwd, { recursive: true, force: true });
    }
  });
});
