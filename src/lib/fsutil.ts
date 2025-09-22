import fs from 'node:fs';
import path from 'node:path';

export function ensureDirSync(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function writeFileSyncAbs(file: string, content: string): void {
  ensureDirSync(path.dirname(file));
  fs.writeFileSync(file, content, 'utf8');
}

export function copyFileSyncAbs(src: string, dest: string): void {
  ensureDirSync(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

export function pathIsInside(child: string, parent: string): boolean {
  const rel = path.relative(parent, child);
  return !!rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}
