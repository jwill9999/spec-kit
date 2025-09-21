import { describe, it, expect } from 'vitest';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtempSync, rmSync } from 'node:fs';
import { convertFileToToml } from '../../src/lib/convert.js';

describe('convertFileToToml', () => {
  it('reads markdown and returns TOML', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'convert-'));
    try {
      const p = path.join(dir, 'cmd.md');
      writeFileSync(p, '---\ndescription: Test\n---\nDo $ARGUMENTS');
      const out = convertFileToToml(p);
      expect(out).toContain('description = "Test"');
      expect(out).toContain('prompt = """');
    } finally {
      try {
        rmSync(dir, { recursive: true, force: true });
      } catch {}
    }
  });
});
