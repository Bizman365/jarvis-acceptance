const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('example passes', () => {
  assert.strictEqual(1 + 1, 2);
});

test('README contains ACCEPTANCE marker', () => {
  const readme = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');
  assert.ok(
    readme.split('\n').includes('ACCEPTANCE: JAR-46'),
    'README.md must contain the exact line "ACCEPTANCE: JAR-46"'
  );
});

test('README contains HARDENED-WORKER marker', () => {
  const readme = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');
  assert.ok(
    readme.split('\n').includes('HARDENED-WORKER: JAR-60'),
    'README.md must contain the exact line "HARDENED-WORKER: JAR-60"'
  );
});
