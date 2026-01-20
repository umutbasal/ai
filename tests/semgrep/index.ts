/**
 * Semgrep Skill Test Suite
 *
 * This test suite validates all semgrep commands documented in the skill.
 *
 * Test organization:
 * - basic.test.ts: Installation, basic matching, inline patterns, rule files
 * - patterns.test.ts: Metavariables, ellipsis, pattern composition
 * - autofix.test.ts: Autofix rules, fix-regex, dry run
 * - generic.test.ts: Generic pattern matching, config files
 *
 * Run tests:
 * - All tests: bun test
 * - Specific suite: bun test basic.test.ts
 * - Watch mode: bun test --watch
 *
 * Prerequisites:
 * - semgrep must be installed (pip install semgrep or brew install semgrep)
 * - All test data files in testdata/ directory
 */
