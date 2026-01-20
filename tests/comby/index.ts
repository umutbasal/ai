/**
 * Comby Skill Test Suite
 * 
 * This test suite validates all comby commands documented in the skill.
 * 
 * Test organization:
 * - basic.test.ts: Installation, basic matching, stdin/stdout, JSON output
 * - properties.test.ts: Case transformers, converters, size props, fresh IDs
 * - rules.test.ts: Equality rules, pattern matching, duplicate detection
 * - patterns.test.ts: Function refactoring, API migration, code cleanup
 * 
 * Run tests:
 * - All tests: bun test
 * - Specific suite: bun test basic.test.ts
 * - Watch mode: bun test --watch
 * 
 * Prerequisites:
 * - comby must be installed (brew install comby)
 * - All test data files in testdata/ directory
 */
