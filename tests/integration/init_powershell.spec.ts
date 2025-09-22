import { describe, it, expect } from 'vitest';
import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import path from 'node:path';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const bin = path.resolve(process.cwd(), 'bin/speckit.js');

describe('specify init --ai claude --script ps --here (PowerShell variant)', () => {
  it('creates .claude/commands with Markdown files containing PowerShell script entries', () => {
    const tempCwd = mkdtempSync(path.join(tmpdir(), 'spec-kit-'));
    try {
      const out = spawnSync(
        'node',
        [bin, 'init', '--ai', 'claude', '--script', 'ps', '--here', '--json'],
        {
          encoding: 'utf8',
          cwd: tempCwd,
        }
      ) as SpawnSyncReturns<string>;
      expect(out.status).toBe(0);
      const obj = JSON.parse(out.stdout) as {
        agent?: string;
        flags?: { script?: string };
        scripts?: { ps?: string };
        templates?: string[];
      };
      expect(obj.agent).toBe('claude');
      expect(obj.flags?.script).toBe('ps');
      // Ensure the PowerShell scripts directory is reported
      const psPath = String(obj.scripts?.ps ?? '');
      expect(psPath).toContain(path.join('scripts', 'powershell'));

      const created = (obj.templates ?? []) as string[];
      expect(created.length).toBeGreaterThan(0);

      const normalize = (s: string) => String(s).replace(/\\/g, '/');
      for (const p of created) {
        // Files should be placed under the Claude directory structure
        expect(normalize(p)).toMatch(/\.claude\/commands\/.+\.md$/);
        const content = readFileSync(p, 'utf8');
        // Where a scripts: block exists, it should include a PowerShell entry
        if (/\n\s*scripts\s*:\s*/.test(content)) {
          // Example: ps: scripts/powershell/check-implementation-prerequisites.ps1 -Json
          expect(content).toMatch(/\n\s*ps:\s*scripts\/powershell\/.+\.ps1\b.*$/m);
        }
        // Ensure {SCRIPT} placeholder remains for templates that use scripts
        const base = path.basename(p).toLowerCase();
        if (base !== 'constitution.md') {
          expect(content).toContain('{SCRIPT}');
        }
      }
    } finally {
      rmSync(tempCwd, { recursive: true, force: true });
    }
  });
});
