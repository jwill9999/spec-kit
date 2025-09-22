import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import { run } from '../../src/cli/main.ts';

function withCapturedIO(fn: () => Promise<void> | void) {
  type WriteFn = typeof process.stdout.write;
  const origStdout: WriteFn = process.stdout.write.bind(process.stdout);
  const origStderr: WriteFn = process.stderr.write.bind(process.stderr);
  let stdout = '';
  let stderr = '';
  const capture: WriteFn = ((
    chunk: string | Uint8Array,
    encoding?: BufferEncoding | ((err?: Error) => void),
    _cb?: (err?: Error) => void
  ) => {
    if (typeof chunk === 'string') {
      stdout += chunk;
    } else {
      const enc: BufferEncoding = typeof encoding === 'string' ? encoding : 'utf8';
      stdout += Buffer.from(chunk).toString(enc);
    }
    return true;
  }) as WriteFn;
  const captureErr: WriteFn = ((
    chunk: string | Uint8Array,
    encoding?: BufferEncoding | ((err?: Error) => void),
    _cb?: (err?: Error) => void
  ) => {
    if (typeof chunk === 'string') {
      stderr += chunk;
    } else {
      const enc: BufferEncoding = typeof encoding === 'string' ? encoding : 'utf8';
      stderr += Buffer.from(chunk).toString(enc);
    }
    return true;
  }) as WriteFn;
  process.stdout.write = capture;
  process.stderr.write = captureErr;
  const restore = () => {
    process.stdout.write = origStdout;
    process.stderr.write = origStderr;
  };
  const runIt = async () => {
    try {
      await fn();
    } finally {
      restore();
    }
    return { stdout, stderr };
  };
  return { runIt };
}

describe('CLI main.ts (unit)', () => {
  let cwdBefore: string;

  beforeEach(() => {
    // Capture the working directory but do not change it (workers disallow chdir)
    cwdBefore = process.cwd();
  });

  afterEach(() => {
    // No-op: ensure cwd unchanged
    expect(process.cwd()).toBe(cwdBefore);
  });

  // Note: We avoid testing `--help` directly because Commander prints and exits the process.
  // Vitest workers disallow process.exit calls. The other tests exercise CLI wiring sufficiently.

  it('check --json returns a JSON object with expected keys', async () => {
    const { runIt } = withCapturedIO(async () => {
      await run(['node', 'speckit', 'check', '--json']);
    });
    const { stdout } = await runIt();
    const obj = JSON.parse(stdout);
    // Basic shape checks; we don\'t assert true/false for tools as they vary by environment
    for (const key of [
      'git',
      'claude',
      'gemini',
      'cursor-agent',
      'qwen',
      'windsurf',
      'opencode',
      'copilot',
    ]) {
      expect(obj).toHaveProperty(key);
      expect(obj[key]).toHaveProperty('ok');
    }
  });

  it('init --json --here --ai claude --dry-run returns a result envelope', async () => {
    const { runIt } = withCapturedIO(async () => {
      await run(['node', 'speckit', 'init', '--json', '--here', '--ai', 'claude', '--dry-run']);
    });
    const { stdout } = await runIt();
    const obj = JSON.parse(stdout);
    expect(obj).toHaveProperty('projectDir');
    expect(path.resolve(obj.projectDir)).toBe(cwdBefore);
    expect(obj.agent).toBe('claude');
    expect(obj.flags?.here).toBe(true);
    expect(obj.flags?.debug ?? false).toBeTypeOf('boolean');
    expect(obj.flags?.script).toBeDefined();
    expect(Array.isArray(obj.templates)).toBe(true);
    expect(obj.notes?.[0] || '').toMatch(/DRY RUN/i);
  });

  it('wizard --json returns a suggested payload', async () => {
    const { runIt } = withCapturedIO(async () => {
      await run(['node', 'speckit', 'wizard', '--json']);
    });
    const { stdout } = await runIt();
    const obj = JSON.parse(stdout);
    expect(obj).toHaveProperty('wizard');
    expect(obj.wizard).toHaveProperty('projectName');
    expect(obj.wizard).toHaveProperty('ai');
    expect(['sh', 'ps']).toContain(obj.wizard.script);
  });

  it('init gemini --json --dry-run yields TOML templates in result list', async () => {
    const { runIt } = withCapturedIO(async () => {
      await run(['node', 'speckit', 'init', 'tmp-gem', '--json', '--ai', 'gemini', '--dry-run']);
    });
    const { stdout } = await runIt();
    const obj = JSON.parse(stdout);
    expect(obj.agent).toBe('gemini');
    expect(Array.isArray(obj.templates)).toBe(true);
    // Should include .toml destinations for TOML agents
    expect(obj.templates.some((p: string) => p.endsWith('.toml'))).toBe(true);
  });

  it('init copilot --json --dry-run yields .prompt.md templates in result list', async () => {
    const { runIt } = withCapturedIO(async () => {
      await run(['node', 'speckit', 'init', 'tmp-cop', '--json', '--ai', 'copilot', '--dry-run']);
    });
    const { stdout } = await runIt();
    const obj = JSON.parse(stdout);
    expect(obj.agent).toBe('copilot');
    expect(Array.isArray(obj.templates)).toBe(true);
    expect(obj.templates.some((p: string) => p.endsWith('.prompt.md'))).toBe(true);
  });

  it('prompts --json returns ok:false when directory is missing', async () => {
    // Ensure the prompts directory is absent
    const promptsDir = path.resolve(process.cwd(), '.github', 'prompts');
    if (fs.existsSync(promptsDir)) {
      // best-effort cleanup to simulate missing dir
      try {
        for (const f of fs.readdirSync(promptsDir)) fs.unlinkSync(path.join(promptsDir, f));
        fs.rmdirSync(promptsDir);
      } catch {
        // ignore; test will still pass if prompts dir ends up empty
      }
    }
    const { runIt } = withCapturedIO(async () => {
      await run(['node', 'speckit', 'prompts', '--json']);
    });
    const { stdout } = await runIt();
    const obj = JSON.parse(stdout);
    expect(obj.ok).toBe(false);
    expect(obj).toHaveProperty('promptsDir');
  });

  it('prompts list/show/not-found branches with a temporary prompts directory', async () => {
    const base = path.resolve(process.cwd(), '.github', 'prompts');
    // Create directory and two prompt files
    fs.mkdirSync(base, { recursive: true });
    const f1 = path.join(base, 'alpha.prompt.md');
    const f2 = path.join(base, 'beta.prompt.md');
    fs.writeFileSync(f1, '# Alpha Prompt\nHello Alpha');
    fs.writeFileSync(f2, '# Beta Prompt\nHello Beta');

    try {
      // List
      let res = await (async () => {
        const { runIt } = withCapturedIO(async () => {
          await run(['node', 'speckit', 'prompts', '--json']);
        });
        return JSON.parse((await runIt()).stdout);
      })();
      expect(res.ok).toBe(true);
      expect(res.count).toBe(2);
      expect(Array.isArray(res.items)).toBe(true);
      // Show specific
      res = await (async () => {
        const { runIt } = withCapturedIO(async () => {
          await run(['node', 'speckit', 'prompts', 'alpha', '--json']);
        });
        return JSON.parse((await runIt()).stdout);
      })();
      expect(res.ok).toBe(true);
      expect(res.name).toBe('alpha');
      expect(res.content).toContain('Hello Alpha');
      // Not found branch
      res = await (async () => {
        const { runIt } = withCapturedIO(async () => {
          await run(['node', 'speckit', 'prompts', 'does-not-exist', '--json']);
        });
        return JSON.parse((await runIt()).stdout);
      })();
      expect(res.ok).toBe(false);
      expect(Array.isArray(res.available)).toBe(true);
    } finally {
      // Cleanup created files/dir
      try {
        for (const f of fs.readdirSync(base)) fs.unlinkSync(path.join(base, f));
        fs.rmdirSync(base);
      } catch {
        // ignore
      }
    }
  });
});
