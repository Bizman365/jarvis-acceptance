const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

test('scheduler prints a JAR-69 staged snapshot and exits 0', () => {
  const script = path.join(__dirname, 'scripts', 'scheduler.js');
  const stdout = execFileSync(process.execPath, [script], { encoding: 'utf8' });

  const snapshot = JSON.parse(stdout);

  assert.strictEqual(snapshot.proof, 'JAR-69', 'proof must be JAR-69');
  assert.strictEqual(snapshot.ok, true, 'ok must be true');
  assert.ok(Array.isArray(snapshot.staged), 'staged must be an array');
  assert.strictEqual(
    snapshot.count,
    snapshot.staged.length,
    'count must match the number of staged jobs'
  );
  assert.ok(snapshot.staged.length > 0, 'at least one job must be staged');

  // Every job is staged and ordered by priority (ascending).
  snapshot.staged.forEach((job, index) => {
    assert.strictEqual(job.state, 'staged', `job ${job.id} must be staged`);
    assert.strictEqual(job.order, index, `job ${job.id} must keep its order`);
    if (index > 0) {
      assert.ok(
        snapshot.staged[index - 1].priority <= job.priority,
        'staged jobs must be sorted by ascending priority'
      );
    }
  });

  // ISO 8601 timestamp: round-trips through Date and re-serializes identically.
  assert.strictEqual(
    new Date(snapshot.timestamp).toISOString(),
    snapshot.timestamp,
    'timestamp must be a valid ISO 8601 string'
  );
});
