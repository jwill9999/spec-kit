// Minimal, robust Markdown command template -> TOML converter
// - Extracts YAML frontmatter `description`
// - Uses the markdown body as TOML `prompt` (triple-quoted)
// - Converts placeholders: $ARGUMENTS and {ARGS} -> {{args}}
// - Leaves {SCRIPT} intact (agent will substitute later)

import { readFileSync } from 'node:fs';

export function mdCommandToToml(mdContent: string): string {
  if (typeof mdContent !== 'string') return '';

  let description = 'Command';
  let body = mdContent;

  // Extract YAML frontmatter if present
  const fmMatch = mdContent.match(/^---\n([\s\S]*?)\n---\s*/);
  if (fmMatch) {
    const fm = fmMatch[1];
    // description: "..." OR description: ...
    const descMatch =
      fm.match(/^description\s*:\s*"([^"]+)"/m) || fm.match(/^description\s*:\s*(.+)$/m);
    if (descMatch) description = String(descMatch[1]).trim();
    body = mdContent.slice(fmMatch[0].length);
  }

  // Placeholder conversions
  body = body.replaceAll('$ARGUMENTS', '{{args}}').replaceAll('{ARGS}', '{{args}}');

  // Avoid breaking TOML triple-quoted string if body contains """
  const safeBody = body.replace(/"""/g, '\\"\\"\\"');

  const esc = (s: string) => String(s).replaceAll('"', '\\"');
  return [
    `description = "${esc(description)}"`,
    '',
    'prompt = """',
    safeBody.trim(),
    '"""',
    '',
  ].join('\n');
}

export function convertFileToToml(srcPath: string): string {
  const mdContent = readFileSync(srcPath, 'utf8');
  return mdCommandToToml(mdContent);
}
