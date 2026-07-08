const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

test('jar79-phase1-smoke exits 0 and prints ok:true with name jar79-phase1', () => {
  const script = path.join(__dirname, 'scripts', 'jar79-phase1-smoke.js');
  const stdout = execFileSync(process.execPath, [script], { encoding: 'utf8' });

  const parsed = JSON.parse(stdout);
  assert.strictEqual(parsed.ok, true, 'ok must be true');
  assert.strictEqual(parsed.name, 'jar79-phase1', 'name must be "jar79-phase1"');
});
