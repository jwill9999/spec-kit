import { resolve } from 'node:path';
import { cwd } from 'node:process';

export interface InitOptions {
  here?: boolean;
  ai?: string | null;
  json?: boolean;
}

export async function runInit(name: string | undefined, opts: InitOptions) {
  const projectDir = opts.here ? resolve(cwd()) : resolve(cwd(), name ?? 'my-project');
  const output = {
    projectDir,
    agent: opts.ai ?? null,
    scripts: { sh: 'scripts/bash/...', ps: 'scripts/powershell/...' },
    templates: [],
    notes: [],
  };
  if (opts.json) {
    console.log(JSON.stringify(output));
  } else {
    console.log(output);
  }
}
