import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach, afterAll } from 'vitest';

describe('speckit constitution command', () => {
  const cli = 'node ./bin/speckit';
  const memDir = path.resolve(__dirname, '../../memory');
  const constFile = path.join(memDir, 'constitution.md');

  beforeEach(() => {
    // Clean up constitution file before each test
    if (fs.existsSync(constFile)) fs.unlinkSync(constFile);
    if (!fs.existsSync(memDir)) fs.mkdirSync(memDir, { recursive: true });
  });

  afterAll(() => {
    // Clean up after all tests
    if (fs.existsSync(constFile)) fs.unlinkSync(constFile);
  });

  it('creates constitution file with --init', () => {
    execSync(`${cli} constitution --init`, { stdio: 'ignore' });
    expect(fs.existsSync(constFile)).toBe(true);
    const content = fs.readFileSync(constFile, 'utf8');
    expect(content).toContain('# Project Constitution');
  });

  it('shows constitution file with --show', () => {
    fs.writeFileSync(constFile, '# Project Constitution\nTest Content\n', 'utf8');
    const output = execSync(`${cli} constitution --show`).toString();
    expect(output).toContain('Test Content');
  });

  it('prints status if file exists and no flags', () => {
    fs.writeFileSync(constFile, '# Project Constitution\n', 'utf8');
    const output = execSync(`${cli} constitution`).toString();
    expect(output).toContain('Constitution file exists');
  });

  it('prints warning if file missing and no flags', () => {
    if (fs.existsSync(constFile)) fs.unlinkSync(constFile);
    const output = execSync(`${cli} constitution`).toString();
    expect(output).toContain('No constitution file found');
  });

  it('shows error if --show and file missing', () => {
    if (fs.existsSync(constFile)) fs.unlinkSync(constFile);
    const output = execSync(`${cli} constitution --show`).toString();
    expect(output).toContain('No constitution file found');
  });
});
