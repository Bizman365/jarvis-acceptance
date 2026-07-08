const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('docs/jar79-phase2-smoke.md contains phase 2 marker', () => {
  const doc = fs.readFileSync(
    path.join(__dirname, 'docs', 'jar79-phase2-smoke.md'),
    'utf8'
  );
  assert.ok(
    doc.includes('JAR-79 phase 2 staged verification'),
    'docs/jar79-phase2-smoke.md must contain the exact text "JAR-79 phase 2 staged verification"'
  );
});
