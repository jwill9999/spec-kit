import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import {
  ensureDirSync,
  writeFileSyncAbs,
  copyFileSyncAbs,
  pathIsInside,
} from '../../src/lib/fsutil';

let base: string;

describe('fsutil', () => {
  beforeEach(() => {
    base = mkdtempSync(path.join(tmpdir(), 'fsutil-'));
  });
  afterEach(() => {
    try {
      rmSync(base, { recursive: true, force: true });
    } catch {
      /* noop */
    }
  });

  it('ensureDirSync creates nested directories', () => {
    const p = path.join(base, 'a/b/c');
    ensureDirSync(p);
    expect(existsSync(p)).toBe(true);
  });

  it('writeFileSyncAbs writes file creating parents', () => {
    const p = path.join(base, 'x/y/z.txt');
    writeFileSyncAbs(p, 'hello');
    expect(readFileSync(p, 'utf8')).toBe('hello');
  });

  it('copyFileSyncAbs copies file creating parents', () => {
    const src = path.join(base, 'src.txt');
    const dest = path.join(base, 'out/dir/dest.txt');
    writeFileSyncAbs(src, 'data');
    copyFileSyncAbs(src, dest);
    expect(readFileSync(dest, 'utf8')).toBe('data');
  });

  it('pathIsInside determines relative containment', () => {
    const child = path.join(base, 'a/b/file.txt');
    const parent = path.join(base, 'a');
    const outside = path.join(base, '..');
    expect(pathIsInside(child, parent)).toBe(true);
    expect(pathIsInside(parent, child)).toBe(false);
    expect(pathIsInside(outside, parent)).toBe(false);
  });
});
