const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

test('health-check exits 0 and prints ok:true with an ISO timestamp', () => {
  const script = path.join(__dirname, 'scripts', 'health-check.js');
  const stdout = execFileSync(process.execPath, [script], { encoding: 'utf8' });

  const parsed = JSON.parse(stdout);
  assert.strictEqual(parsed.ok, true, 'ok must be true');
  assert.strictEqual(typeof parsed.timestamp, 'string', 'timestamp must be a string');

  // ISO 8601 timestamp: round-trips through Date and re-serializes identically.
  assert.strictEqual(
    new Date(parsed.timestamp).toISOString(),
    parsed.timestamp,
    'timestamp must be a valid ISO 8601 string'
  );
});
