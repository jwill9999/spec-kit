import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const CLI = 'node ./bin/speckit';
const SPECS_DIR = path.resolve(__dirname, '../../specs');

// Helper to clean up created branches and spec dirs
function cleanupSpecsAndBranches(unique?: string) {
  if (fs.existsSync(SPECS_DIR)) {
    for (const entry of fs.readdirSync(SPECS_DIR)) {
      const full = path.join(SPECS_DIR, entry);
      try {
        if (fs.lstatSync(full).isDirectory()) {
          fs.rmSync(full, { recursive: true, force: true });
        } else {
          fs.unlinkSync(full);
        }
      } catch {}
    }
  }
}

describe('speckit specify command', () => {
  // Use a unique string for each test run
  let unique: string;
  let createdBranch: string | null = null;
  let createdSpecDir: string | null = null;

  beforeEach(() => {
    // Clean up all files and directories in specs/ before each test
    cleanupSpecsAndBranches();
    unique = `test${Date.now()}${Math.floor(Math.random() * 10000)}`;
    createdBranch = null;
    createdSpecDir = null;
  });

  afterEach(() => {
    // Clean up all files and directories in specs/ after each test
    cleanupSpecsAndBranches();
  });

  it('creates a new feature spec and branch from a description', () => {
    const desc = `Test feature for user login flow ${unique}`;
    // Pass the description as a single argument by quoting it
    const output = execSync(`${CLI} specify "${desc}"`).toString();
    expect(output).toContain('Feature spec created:');
    // Extract branch and spec file path
    const branchMatch = output.match(/Branch: (.+)/);
    const fileMatch = output.match(/Spec file: (.+)/);
    expect(branchMatch).toBeTruthy();
    expect(fileMatch).toBeTruthy();
    const branch = branchMatch ? branchMatch[1].trim() : '';
    const specFile = fileMatch ? fileMatch[1].trim() : '';
    // Updated to match the new branch naming convention
    expect(branch).toMatch(/^feature\/\d{4}-/);
    expect(fs.existsSync(specFile)).toBe(true);
    const content = fs.readFileSync(specFile, 'utf8');
    // The folder name (without 'feature/' prefix) is what appears in the Markdown file
    const folderName = branch.replace(/^feature\//, '');
    expect(content).toContain(folderName);
    expect(content).toContain(desc);
    // Optionally, check for the main heading (not strict on exact match)
    expect(content).toMatch(/# Feature Specification:/);
    // Mark for cleanup
    createdBranch = branch;
    createdSpecDir = path.dirname(specFile);
  });

  it('errors if no description is provided', () => {
    let error = '';
    try {
      execSync(`${CLI} specify`, { stdio: 'pipe' });
    } catch (e: any) {
      error = e.stderr?.toString() || e.stdout?.toString() || e.message;
    }
    // Match the actual CLI error message
    expect(error).toMatch(/error: missing required argument 'featureDescription'/i);
  });

  it('errors if required script is missing', () => {
    // Temporarily rename the script
    const scriptPath = path.resolve(__dirname, '../../scripts/bash/create-new-feature.sh');
    const backupPath = scriptPath + '.bak';
    if (fs.existsSync(scriptPath)) fs.renameSync(scriptPath, backupPath);
    let error = '';
    try {
      execSync(`${CLI} specify Feature with missing script`, { stdio: 'pipe' });
    } catch (e: any) {
      error = e.stderr?.toString() || e.stdout?.toString() || e.message;
    }
    if (fs.existsSync(backupPath)) fs.renameSync(backupPath, scriptPath);
    expect(error).toMatch(/Required script not found/);
  });
});
