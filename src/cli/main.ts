import { Command } from 'commander';
import pc from 'picocolors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getAgentTarget, isTomlAgent } from '../lib/agents.js';
import { ensureDirSync, copyFileSyncAbs } from '../lib/fsutil.js';
import { detectTools } from '../lib/detect.js';
import { mdCommandToToml } from '../lib/tomlify.js';

export async function run(argv: string[] = process.argv as unknown as string[]) {
  const program = new Command();
  const AI_CHOICES = [
    'claude',
    'gemini',
    'copilot',
    'cursor',
    'qwen',
    'opencode',
    'windsurf',
  ] as const;

  program
    .name('specify')
    .description(
      'Spec Kit CLI — drive Spec-Driven Development (SDD): /constitution → /specify → /plan → /tasks → /implement.'
    )
    .version('0.1.0');

  // Friendlier help/suggestions
  program.showHelpAfterError('(use --help for usage)');
  program.showSuggestionAfterError(true);

  // Global help header and footer
  program.addHelpText(
    'before',
    [
      pc.bold(pc.green('Spec Kit')),
      '',
      'Build high-quality software faster using Spec-Driven Development (SDD).',
      '',
    ].join('\n')
  );
  program.addHelpText(
    'after',
    [
      '',
      'Examples:',
      '  $ specify check',
      '  $ specify init my-app --ai claude',
      '  $ specify init --here --ai copilot',
      '',
      `Supported agents: ${AI_CHOICES.join(', ')}`,
      'Docs: https://github.com/github/spec-kit#-specify-cli-reference',
    ].join('\n')
  );

  // Repo-local persisted defaults for wizard/init
  function getWizardConfigPaths() {
    const cwd = process.cwd();
    const dir = path.resolve(cwd, '.specify');
    const file = path.join(dir, 'wizard.json');
    return { dir, file };
  }

  function loadWizardDefaults(): Record<string, unknown> {
    try {
      const { file } = getWizardConfigPaths();
      if (fs.existsSync(file)) {
        const txt = fs.readFileSync(file, 'utf8');
        const data = JSON.parse(txt);
        return data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
      }
    } catch {
      // ignore
    }
    return {};
  }

  function saveWizardDefaults(prefs: any) {
    try {
      const { dir, file } = getWizardConfigPaths();
      ensureDirSync(dir);
      const safe = {
        ai: prefs.ai ?? null,
        script: prefs.script ?? 'sh',
        here: !!prefs.here,
        noGit: !!prefs.noGit,
        ignoreAgentTools: !!prefs.ignoreAgentTools,
        debug: !!prefs.debug,
        lastProjectName: prefs.projectName ?? undefined,
      } as Record<string, unknown>;
      fs.writeFileSync(file, JSON.stringify(safe, null, 2) + '\n', 'utf8');
    } catch {
      // best-effort
    }
  }

  // Small interactive prompt helper (no external deps)
  async function runInitWizard(preset: any = {}, presetName?: string) {
    const { createInterface } = await import('node:readline/promises');
    const { stdin: input, stdout: output } = await import('node:process');

    const rl = createInterface({ input, output });
    const _isTTY =
      output && typeof (output as any).isTTY === 'boolean' ? (output as any).isTTY : false;

    function fmtQuestion(q: string, def?: string) {
      return def ? `${q} ${pc.dim(`(${def})`)}: ` : `${q}: `;
    }

    async function askText(q: string, def?: string) {
      const ans = await rl.question(fmtQuestion(q, def));
      return ans && ans.trim().length ? ans.trim() : def;
    }

    async function askYesNo(q: string, defBool = false) {
      const def = defBool ? 'Y/n' : 'y/N';
      const ans = await rl.question(`${q} ${pc.dim(`(${def})`)}: `);
      const v = (ans || '').trim().toLowerCase();
      if (!v) return defBool;
      return v === 'y' || v === 'yes';
    }

    async function askChoice(q: string, values: string[], defIndex = 0) {
      (output as any).write(`${q}\n`);
      for (let i = 0; i < values.length; i++) {
        const mark = i === defIndex ? pc.dim('*') : ' ';
        (output as any).write(`  ${mark} [${i + 1}] ${values[i]}\n`);
      }
      const ans = await rl.question(fmtQuestion('Choose a number', String(defIndex + 1)));
      const n = parseInt(ans, 10);
      const idx = Number.isFinite(n) && n >= 1 && n <= values.length ? n - 1 : defIndex;
      return values[idx];
    }

    (output as any).write(`${pc.bold(pc.green('Specify Wizard'))}\n`);
    (output as any).write("Let's set up your project with a few questions.\n\n");

    // Detect available tools for inline hints
    const toolStatus = await detectTools();
    const agentToTool: Record<string, string | null> = {
      claude: 'claude',
      gemini: 'gemini',
      cursor: 'cursor-agent',
      qwen: 'qwen',
      opencode: 'opencode',
      windsurf: null, // IDE-based
      copilot: null, // IDE-based
    };
    const aiValues = [...AI_CHOICES].map(String);
    const aiLabels = aiValues.map((a) => {
      const tool = agentToTool[a];
      if (!tool) return `${a} ${pc.dim('(IDE)')}`;
      const info = (toolStatus as any)[tool];
      const ok = info && info.ok;
      return ok ? `${a} ${pc.green('(CLI found)')}` : `${a} ${pc.red('(CLI missing)')}`;
    });

    // Load and merge persisted defaults
    const persisted = loadWizardDefaults();
    const merged: any = { ...(persisted as any), ...(preset as any) };

    // Always ask for project name first
    const name = await askText(
      'Project name (directory)',
      presetName ??
        (merged.projectName as string | undefined) ??
        ((persisted as any).lastProjectName as string | undefined) ??
        'my-project'
    );

    // If we have saved presets, offer to use them. When accepted, only ask for missing fields.
    const hasPresets = persisted && Object.keys(persisted).length > 0;
    let here: boolean | undefined,
      ai: string | undefined,
      script: 'sh' | 'ps' | undefined,
      noGit: boolean | undefined,
      ignoreAgentTools: boolean | undefined,
      debug: boolean | undefined,
      dryRun: boolean | undefined;
    if (hasPresets) {
      // Show a tiny banner with current presets
      const preview = {
        projectName:
          presetName ??
          (merged.projectName as string | undefined) ??
          ((persisted as any).lastProjectName as string | undefined) ??
          'my-project',
        ai: (merged.ai as string) || 'claude',
        script: (merged.script as string) || 'sh',
        flags: {
          here: !!merged.here,
          noGit: !!merged.noGit,
          ignoreAgentTools: !!merged.ignoreAgentTools,
          debug: !!merged.debug,
          dryRun: !!merged.dryRun,
        },
      };
      // Prepare lines for presets summary
      const flagStr = Object.entries(preview.flags)
        .map(([k, v]) => `${k}=${v ? 'true' : 'false'}`)
        .join(', ');
      const rawLines = [
        'Detected saved presets (.specify/wizard.json):',
        `  project: ${preview.projectName}`,
        `  ai: ${preview.ai}`,
        `  script: ${preview.script}`,
        `  flags: ${flagStr}`,
      ];
      // Helpers to render the banner responsively
      function wrapInto(width: number, text: string) {
        if (text.length <= width) return [text];
        const parts: string[] = [];
        let s = text;
        while (s.length > width) {
          let cut = s.lastIndexOf(' ', width);
          if (cut <= 0) cut = width;
          parts.push(s.slice(0, cut));
          s = s.slice(cut).replace(/^\s+/, '');
        }
        if (s.length) parts.push(s);
        return parts;
      }

      function renderPresetsBanner() {
        const termCols =
          ((output as any) && (output as any).columns) ||
          (process && process.stdout && process.stdout.columns) ||
          80;
        const minInner = 24;
        const longest = Math.max(...rawLines.map((l) => l.length));
        const innerWidth = Math.max(minInner, Math.min(longest, Math.max(minInner, termCols - 4)));

        if (termCols < minInner + 4) {
          // plain
          (output as any).write(pc.cyan(rawLines[0]) + '\n');
          for (let i = 1; i < rawLines.length; i++) (output as any).write(rawLines[i] + '\n');
          (output as any).write('\n');
          return;
        }
        const compactCutoff = minInner + 8;
        if (termCols <= compactCutoff) {
          const innerC = Math.max(6, termCols - 2);
          const topC = '┌' + '─'.repeat(innerC) + '┐';
          const bottomC = '└' + '─'.repeat(innerC) + '┘';
          (output as any).write(pc.cyan(topC) + '\n');
          for (const line of rawLines) {
            const wrapped = wrapInto(innerC, line);
            for (const w of wrapped) {
              const pad = ' '.repeat(Math.max(0, innerC - w.length));
              (output as any).write(pc.cyan('│') + w + pad + pc.cyan('│') + '\n');
            }
          }
          (output as any).write(pc.cyan(bottomC) + '\n\n');
        } else {
          const top = '┌' + '─'.repeat(innerWidth + 2) + '┐';
          const bottom = '└' + '─'.repeat(innerWidth + 2) + '┘';
          (output as any).write(pc.cyan(top) + '\n');
          for (const line of rawLines) {
            const wrapped = wrapInto(innerWidth, line);
            for (const w of wrapped) {
              const pad = ' '.repeat(innerWidth - w.length);
              (output as any).write(pc.cyan('│ ') + w + pad + pc.cyan(' │') + '\n');
            }
          }
          (output as any).write(pc.cyan(bottom) + '\n\n');
        }
      }

      // Custom yes/no that reflows the banner on resize without losing input
      async function askYesNoWithResize(q: string, defBool = false) {
        const def = defBool ? 'Y/n' : 'y/N';
        const promptText = `${q} ${pc.dim(`(${def})`)}: `;
        const ttyOut: any = (output as any) && (output as any).isTTY ? output : process.stdout;

        // Initial render (banner already printed above). Ensure prompt is shown.
        ttyOut.write(promptText);

        return await new Promise<boolean>((resolve) => {
          const onLine = (answer: string) => {
            cleanup();
            const v = (answer || '').trim().toLowerCase();
            resolve(v ? v === 'y' || v === 'yes' : defBool);
          };

          const onResize = () => {
            try {
              const current = (rl as any).line || '';
              // Clear screen and redraw header + banner + prompt + current input
              ttyOut.write('\u001b[2J'); // clear screen
              ttyOut.write('\u001b[H'); // cursor to home
              ttyOut.write(`${pc.bold(pc.green('Specify Wizard'))}\n`);
              ttyOut.write("Let's set up your project with a few questions.\n\n");
              renderPresetsBanner();
              ttyOut.write(promptText);
              (rl as any).write(current);
            } catch {
              // ignore rendering errors
            }
          };

          const cleanup = () => {
            (rl as any).off('line', onLine);
            if (ttyOut && ttyOut.off) ttyOut.off('resize', onResize);
          };

          (rl as any).once('line', onLine);
          if (ttyOut && ttyOut.on) ttyOut.on('resize', onResize);
        });
      }

      // Initial banner render
      renderPresetsBanner();
      const useSaved = await askYesNoWithResize(
        'Use saved presets from .specify/wizard.json?',
        true
      );
      if (useSaved) {
        // here
        if (typeof merged.here === 'boolean') {
          here = !!merged.here;
        } else {
          here = await askYesNo('Initialize in current directory?', false);
        }
        // ai
        if (merged.ai) {
          ai = String(merged.ai);
        } else {
          const aiLabel = await askChoice(
            'AI assistant to configure',
            aiLabels,
            Math.max(0, aiValues.indexOf('claude'))
          );
          const aiIndex = aiLabels.indexOf(aiLabel);
          ai = aiValues[Math.max(0, aiIndex)];
        }
        // script
        if (merged.script) {
          script = merged.script === 'ps' ? 'ps' : 'sh';
        } else {
          script = (await askChoice('Script variant', ['sh', 'ps'], 0)) as 'sh' | 'ps';
        }
        // booleans
        noGit =
          typeof merged.noGit === 'boolean'
            ? !!merged.noGit
            : await askYesNo('Skip git initialization?', false);
        ignoreAgentTools =
          typeof merged.ignoreAgentTools === 'boolean'
            ? !!merged.ignoreAgentTools
            : await askYesNo('Skip agent tool checks?', false);
        debug =
          typeof merged.debug === 'boolean'
            ? !!merged.debug
            : await askYesNo('Enable debug output?', false);
        dryRun =
          typeof merged.dryRun === 'boolean'
            ? !!merged.dryRun
            : await askYesNo('Perform a dry run (no files written)?', false);
      }
    }

    // If we didn't accept presets, fall back to full interactive flow with defaults from merged
    if (here === undefined)
      here = await askYesNo('Initialize in current directory?', !!(merged as any).here);
    if (!ai) {
      const aiLabel = await askChoice(
        'AI assistant to configure',
        aiLabels,
        Math.max(0, aiValues.indexOf(((merged as any).ai as string) || 'claude'))
      );
      const aiIndex = aiLabels.indexOf(aiLabel);
      ai = aiValues[Math.max(0, aiIndex)];
    }
    if (!script)
      script = (await askChoice(
        'Script variant',
        ['sh', 'ps'],
        (merged as any).script === 'ps' ? 1 : 0
      )) as 'sh' | 'ps';
    if (noGit === undefined)
      noGit = await askYesNo('Skip git initialization?', !!(merged as any).noGit);
    if (ignoreAgentTools === undefined)
      ignoreAgentTools = await askYesNo(
        'Skip agent tool checks?',
        !!(merged as any).ignoreAgentTools
      );
    if (debug === undefined)
      debug = await askYesNo('Enable debug output?', !!(merged as any).debug);
    if (dryRun === undefined)
      dryRun = await askYesNo('Perform a dry run (no files written)?', !!(merged as any).dryRun);

    await rl.close();

    return {
      projectName: name,
      ai,
      here,
      script,
      noGit,
      ignoreAgentTools,
      debug,
      dryRun,
      json: false,
    } as any;
  }

  program
    .command('check')
    .description('Validate availability of required/optional tools')
    .option('--json', 'Output JSON')
    .action(async (opts: any) => {
      const res = await detectTools();
      if (opts.json) {
        process.stdout.write(JSON.stringify(res) + '\n');
      } else {
        for (const [tool, info] of Object.entries(res)) {
          const mark = (info as any).ok ? pc.green('✓') : pc.red('✗');
          console.log(
            `${mark} ${tool}${(info as any).version ? ` (${(info as any).version})` : ''}`
          );
        }
      }
    })
    .addHelpText(
      'after',
      [
        '',
        'Notes:',
        '  - CLI-based agents show as available when their command is on PATH.',
        '  - IDE-based agents (copilot, windsurf) may not have a CLI; they are optional.',
        '',
        'Example:',
        '  $ specify check --json | jq',
      ].join('\n')
    );

  // Perform init implementation (extracted for reuse by init and wizard)
  async function performInit(projectName: string | undefined, options: any) {
    const cwd = process.cwd();
    const projectDir = options.here ? cwd : path.resolve(cwd, projectName ?? '.');

    // Create project dir if needed (safe, recursive), unless dry run
    if (!options.dryRun) ensureDirSync(projectDir);

    // Determine agent target and copy command templates
    const selected = getAgentTarget(options.ai);
    let created: string[] = [];
    if (selected) {
      const targetDir = path.resolve(projectDir, selected.path);
      if (!options.dryRun) ensureDirSync(targetDir);

      // Source templates live in templates/commands/*.md (markdown) with placeholders
      // Resolve relative to this file's location so it works regardless of CWD
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const templatesDir = path.resolve(__dirname, '../../templates/commands');
      if (fs.existsSync(templatesDir)) {
        for (const file of fs.readdirSync(templatesDir)) {
          const src = path.join(templatesDir, file);
          const ext = path.extname(file);
          if (isTomlAgent(options.ai)) {
            // Convert Markdown to TOML and write with .toml extension
            const md = fs.readFileSync(src, 'utf8');
            const toml = mdCommandToToml(md);
            const base = path.basename(file, ext);
            const dest = path.join(targetDir, `${base}.toml`);
            if (!options.dryRun) fs.writeFileSync(dest, toml, 'utf8');
            created.push(dest);
          } else {
            // Copy Markdown files directly for non-TOML agents
            // Special case: Copilot expects *.prompt.md filenames
            let dest: string;
            if (String(options.ai).toLowerCase() === 'copilot') {
              const base = path.basename(file, ext);
              dest = path.join(targetDir, `${base}.prompt.md`);
              const content = fs.readFileSync(src, 'utf8');
              if (!options.dryRun) fs.writeFileSync(dest, content, 'utf8');
            } else {
              dest = path.join(targetDir, file);
              if (!options.dryRun) copyFileSyncAbs(src, dest);
            }
            created.push(dest);
          }
        }
      }
    }

    const result = {
      projectDir,
      agent: options.ai ?? null,
      scripts: {
        sh: path.resolve(cwd, 'scripts/bash'),
        ps: path.resolve(cwd, 'scripts/powershell'),
      },
      templates: created,
      flags: {
        here: !!options.here,
        noGit: !!options.noGit,
        ignoreAgentTools: !!options.ignoreAgentTools,
        script: options.script || 'sh',
        skipTls: !!options.skipTls,
        debug: !!options.debug,
      },
      notes: created.length
        ? [
            options.dryRun
              ? 'DRY RUN: Would initialize project directory and copy agent command templates'
              : 'Initialized project directory and copied agent command templates',
          ]
        : [
            options.dryRun
              ? 'DRY RUN: Would initialize project directory (no agent templates – no/unknown agent)'
              : 'Initialized project directory (no agent templates copied – no/unknown agent)',
          ],
    };

    if (options.json) {
      process.stdout.write(JSON.stringify(result) + '\n');
    } else {
      console.log(pc.green('Initialization complete.'));
      console.log(result);
    }
  }

  // Init command with optional interactive mode
  program
    .command('init [projectName]')
    .description('Initialize a new Specify project')
    .option('--ai <agent>', `AI assistant to configure (one of: ${AI_CHOICES.join(', ')})`)
    .option('--script <variant>', 'sh|ps', 'sh')
    .option('--ignore-agent-tools')
    .option('--no-git')
    .option('--here')
    .option('--skip-tls')
    .option('--debug')
    .option('--github-token <token>')
    .option('--json', 'Output JSON')
    .option('--dry-run', 'Preview without writing files')
    .option('-y, --yes', 'Accept suggested defaults (non-interactive)')
    .option('--interactive', 'Run an interactive walkthrough to collect options')
    .action(async (projectName: string | undefined, options: any) => {
      if (options.yes && !options.json) {
        const persisted = loadWizardDefaults();
        const final = {
          projectName:
            projectName ??
            ((persisted as any).lastProjectName as string | undefined) ??
            'my-project',
          ai: options.ai ?? (persisted as any).ai ?? 'claude',
          here: options.here ?? (persisted as any).here ?? false,
          script: options.script ?? (persisted as any).script ?? 'sh',
          noGit: options.noGit ?? (persisted as any).noGit ?? false,
          ignoreAgentTools:
            options.ignoreAgentTools ?? (persisted as any).ignoreAgentTools ?? false,
          debug: options.debug ?? (persisted as any).debug ?? false,
          dryRun: options.dryRun ?? false,
          json: !!options.json,
        } as any;
        saveWizardDefaults(final);
        await performInit(final.projectName, final);
        return;
      }
      if (options.interactive && !options.json) {
        const answers = await runInitWizard(options, projectName);
        projectName = (answers as any).projectName;
        options = { ...options, ...answers };
        saveWizardDefaults(options);
      }
      await performInit(projectName, options);
    })
    .addHelpText(
      'after',
      [
        '',
        'Examples:',
        '  $ specify init my-project --ai claude',
        '  $ specify init --here --ai copilot',
        '  $ specify init my-project --ai gemini --script ps',
        '  $ specify init --interactive',
        '  $ specify init my-project --ai claude --dry-run',
        '  $ specify init -y                # accept suggested defaults',
        '',
        'Details:',
        '  - Copies agent-specific command templates into the correct directory structure.',
        '  - Use --ignore-agent-tools to skip checking for installed agent CLIs.',
        '  - Use --dry-run to preview file operations without writing.',
        '  - Use --json to output a machine-readable result envelope.',
        '  - Use --yes to accept suggested defaults based on persisted preferences.',
      ].join('\n')
    );

  // Wizard command for a guided walkthrough
  program
    .command('wizard')
    .description('Interactive walkthrough to initialize a project (guided mode)')
    .option('-y, --yes', 'Accept suggested defaults from persisted preferences (skip prompts)')
    .option(
      '--json',
      'Output JSON (wizard questions are skipped; prints a suggested payload instead)'
    )
    .addHelpText(
      'after',
      [
        '',
        'Examples:',
        '  $ specify wizard',
        '  $ specify wizard -y        # use persisted defaults without prompts',
        '',
        'Notes:',
        '  - Same as `specify init --interactive`.',
        '  - With --yes, loads defaults from .specify/wizard.json and bypasses questions.',
        '  - Does not run interactive prompts when --json is provided; prints a suggested payload instead.',
      ].join('\n')
    )
    .action(async (options: any) => {
      if (options.json) {
        const suggested = {
          projectName: 'my-project',
          ai: AI_CHOICES[0],
          here: false,
          script: 'sh',
          noGit: false,
          ignoreAgentTools: false,
          debug: false,
          dryRun: false,
        };
        process.stdout.write(JSON.stringify({ wizard: suggested }) + '\n');
        return;
      }
      if (options.yes) {
        const persisted = loadWizardDefaults();
        const final = {
          projectName: ((persisted as any).lastProjectName as string | undefined) ?? 'my-project',
          ai: (persisted as any).ai ?? 'claude',
          here: !!(persisted as any).here,
          script: (persisted as any).script ?? 'sh',
          noGit: !!(persisted as any).noGit,
          ignoreAgentTools: !!(persisted as any).ignoreAgentTools,
          debug: !!(persisted as any).debug,
          dryRun: false,
          json: false,
        } as any;
        // Save to refresh lastProjectName etc.
        saveWizardDefaults(final);
        await performInit(final.projectName, final);
      } else {
        const answers = await runInitWizard(loadWizardDefaults());
        saveWizardDefaults(answers);
        await performInit((answers as any).projectName, answers);
      }
    });

  // Prompts helper: list/show repository Copilot prompts in .github/prompts
  program
    .command('prompts [name]')
    .description('List or show Copilot prompt files from .github/prompts')
    .option('--json', 'Output JSON')
    .action(async (name: string | undefined, options: any) => {
      const cwd = process.cwd();
      const promptsDir = path.resolve(cwd, '.github', 'prompts');
      const exists = fs.existsSync(promptsDir);
      if (!exists) {
        const payload = { ok: false, reason: 'No .github/prompts directory found', promptsDir };
        if (options.json) {
          process.stdout.write(JSON.stringify(payload) + '\n');
          return;
        }
        console.log(pc.yellow((payload as any).reason + ` at ${promptsDir}`));
        return;
      }

      const all = fs
        .readdirSync(promptsDir)
        .filter((f) => f.toLowerCase().endsWith('.prompt.md'))
        .map((f) => ({ name: path.basename(f, '.prompt.md'), file: path.join(promptsDir, f) }));

      if (!name) {
        const payload = { ok: true, count: all.length, items: all };
        if (options.json) {
          process.stdout.write(JSON.stringify(payload) + '\n');
          return;
        }
        console.log(pc.cyan(`Found ${all.length} prompt(s):`));
        for (const it of all) console.log(`- ${it.name} (${it.file})`);
        return;
      }

      // show a single prompt by base name or file name
      const match = all.find(
        (it) =>
          it.name.toLowerCase() === String(name).toLowerCase() ||
          path.basename(it.file).toLowerCase() === String(name).toLowerCase()
      );
      if (!match) {
        const payload = {
          ok: false,
          reason: `Prompt not found: ${name}`,
          available: all.map((i) => i.name),
        };
        if (options.json) {
          process.stdout.write(JSON.stringify(payload) + '\n');
          return;
        }
        console.log(pc.red((payload as any).reason));
        if (all.length) console.log('Available:', all.map((i) => i.name).join(', '));
        return;
      }

      const content = fs.readFileSync(match.file, 'utf8');
      if (options.json) {
        const payload = { ok: true, name: match.name, file: match.file, content };
        process.stdout.write(JSON.stringify(payload) + '\n');
      } else {
        // Print raw content so it can be piped to clipboard (pbcopy) or pasted into Copilot Chat
        process.stdout.write(content + (content.endsWith('\n') ? '' : '\n'));
      }
    });

  await program.parseAsync(argv);
}

// If invoked directly via dist import, run with process.argv
// Not strictly necessary, but safe if this module is executed as the entry
if (import.meta.url === `file://${process.argv[1]}`) {
  void run(process.argv as unknown as string[]);
}
