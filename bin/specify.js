#!/usr/bin/env node
// Dist-only launcher for TS-first build. If dist is missing, print a helpful hint.
(async () => {
  try {
    const mod = await import('../dist/cli/main.js');
    if (mod && typeof mod.run === 'function') {
      await mod.run(process.argv);
    }
    // If no run is exported, the dist module is expected to self-execute via parseAsync.
  } catch (_err) {
    const msg =
      'Specify CLI: compiled output missing. Please run "npm run build" (or "npm test" which builds first).';
    try {
      console.error(JSON.stringify({ error: { message: msg } }));
    } catch {
      console.error(msg);
    }
    process.exit(1);
  }
})();
