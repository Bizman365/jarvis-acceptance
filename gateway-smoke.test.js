const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('gateway smoke doc contains JAR-77 marker', () => {
  const doc = fs.readFileSync(
    path.join(__dirname, 'docs', 'jar77-gateway-smoke.md'),
    'utf8'
  );
  assert.ok(
    doc.split('\n').includes('JAR-77 gateway seat connection works'),
    'docs/jar77-gateway-smoke.md must contain the exact line "JAR-77 gateway seat connection works"'
  );
});
