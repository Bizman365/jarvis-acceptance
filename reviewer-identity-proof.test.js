const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('README contains REVIEWER-IDENTITY proof marker', () => {
  const readme = fs.readFileSync(path.join(__dirname, 'README.md'), 'utf8');
  assert.ok(
    readme.split('\n').includes('REVIEWER-IDENTITY: PEXLO-JAR-66'),
    'README.md must contain the exact line "REVIEWER-IDENTITY: PEXLO-JAR-66"'
  );
});
