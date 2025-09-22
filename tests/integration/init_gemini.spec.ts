import { describe, it, expect } from 'vitest';
import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import path from 'node:path';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const bin = path.resolve(process.cwd(), 'bin/speckit.js');

describe('specify init --ai gemini --here (TOML agent)', () => {
  it('creates .gemini/commands with .toml files and TOML structure', () => {
    const tempCwd = mkdtempSync(path.join(tmpdir(), 'spec-kit-'));
    try {
      const out = spawnSync('node', [bin, 'init', '--ai', 'gemini', '--here', '--json'], {
        encoding: 'utf8',
        cwd: tempCwd,
      }) as SpawnSyncReturns<string>;
      expect(out.status).toBe(0);
      const obj = JSON.parse(out.stdout) as { agent?: string; templates?: string[] };
      expect(obj.agent).toBe('gemini');
      const created = (obj.templates ?? []) as string[];
      expect(created.length).toBeGreaterThan(0);
      const normalize = (s: string) => s.replace(/\\/g, '/');
      for (const p of created) {
        expect(normalize(p)).toMatch(/\.gemini\/commands\/.+\.toml$/);
        const content = readFileSync(p, 'utf8');
        // Minimal checks: has description and prompt keys in TOML
        expect(content).toMatch(/^description\s*=\s*".+"/m);
        expect(content).toMatch(/\nprompt\s*=\s*"""[\s\S]*"""\n?$/m);
        // Ensure placeholders converted to {{args}}
        if (content.includes('{{args}}')) {
          expect(content).not.toContain('$ARGUMENTS');
          expect(content).not.toContain('{ARGS}');
        }
      }
    } finally {
      rmSync(tempCwd, { recursive: true, force: true });
    }
  });
});
