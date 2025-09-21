import { describe, it, expect } from 'vitest';
import { mdCommandToToml as mdCommandToTomlLegacy } from '../../src/lib/convert.js';
import { mdCommandToToml } from '../../src/lib/tomlify.ts';

const md = `---
description: Command purpose
---
Run {SCRIPT} with $ARGUMENTS and {ARGS}
`;

describe('converters md->toml', () => {
  it('mdCommandToToml (legacy) converts description and body', () => {
    const out = mdCommandToTomlLegacy(md);
    expect(out).toContain('description = "Command purpose"');
    expect(out).toContain('prompt = """');
  });

  it('mdCommandToToml (robust) converts description and placeholders', () => {
    const out = mdCommandToToml(md);
    expect(out).toContain('description = "Command purpose"');
    expect(out).toContain('{{args}}');
    // {SCRIPT} should remain
    expect(out).toContain('{SCRIPT}');
  });

  it('mdCommandToToml handles no frontmatter safely', () => {
    const bodyOnly = 'Hello $ARGUMENTS';
    const out = mdCommandToToml(bodyOnly);
    expect(out).toContain('description = "Command"');
    expect(out).toContain('{{args}}');
  });
});
