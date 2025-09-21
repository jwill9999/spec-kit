import { describe, it, expect } from 'vitest';
import { agentDirs, getAgentTarget, isTomlAgent } from '../../src/lib/agents.ts';

describe('agents helpers', () => {
  it('getAgentTarget returns path and format for known agents', () => {
    expect(getAgentTarget('claude')).toEqual(agentDirs.claude);
    expect(getAgentTarget('Gemini')).toEqual(agentDirs.gemini);
    expect(getAgentTarget('QWEN')).toEqual(agentDirs.qwen);
  });

  it('getAgentTarget returns null for unknown or falsy', () => {
    expect(getAgentTarget('unknown')).toBeNull();
    expect(getAgentTarget(null)).toBeNull();
    expect(getAgentTarget(undefined)).toBeNull();
  });

  it('isTomlAgent detects TOML agents', () => {
    expect(isTomlAgent('gemini')).toBe(true);
    expect(isTomlAgent('qwen')).toBe(true);
    expect(isTomlAgent('claude')).toBe(false);
    expect(isTomlAgent('')).toBe(false);
  });
});
