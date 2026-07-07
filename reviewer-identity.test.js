const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('README contains REVIEWER_IDENTITY marker', () => {
  const readme = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');
  assert.ok(
    readme.split('\n').includes('REVIEWER_IDENTITY: JAR-66'),
    'README.md must contain the exact line "REVIEWER_IDENTITY: JAR-66"'
  );
});
