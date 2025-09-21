import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';

function run(args: string[]) {
  return spawnSync('node', ['bin/specify.js', ...args], { encoding: 'utf8' });
}

describe('specify check --json', () => {
  it('prints JSON with tool statuses', () => {
    const { status, stdout } = run(['check', '--json']);
    expect(status).toBe(0);
    const obj = JSON.parse(stdout);
    expect(obj).toHaveProperty('git');
  });
});
