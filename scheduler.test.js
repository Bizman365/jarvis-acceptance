const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { stageTasks, snapshot } = require('./scripts/scheduler.js');

test('stageTasks groups independent tasks into a single stage', () => {
  const { stages } = stageTasks([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
  assert.deepStrictEqual(stages, [['a', 'b', 'c']]);
});

test('stageTasks places dependents in later stages than their deps', () => {
  const { stages } = stageTasks([
    { id: 'a' },
    { id: 'b', deps: ['a'] },
    { id: 'c', deps: ['b'] },
  ]);
  assert.deepStrictEqual(stages, [['a'], ['b'], ['c']]);
});

test('stageTasks runs siblings sharing a dependency concurrently', () => {
  const { stages } = stageTasks([
    { id: 'root' },
    { id: 'x', deps: ['root'] },
    { id: 'y', deps: ['root'] },
  ]);
  assert.deepStrictEqual(stages, [['root'], ['x', 'y']]);
});

test('stageTasks rejects unknown dependencies', () => {
  assert.throws(() => stageTasks([{ id: 'a', deps: ['missing'] }]), /unknown task/);
});

test('stageTasks rejects dependency cycles', () => {
  assert.throws(
    () => stageTasks([{ id: 'a', deps: ['b'] }, { id: 'b', deps: ['a'] }]),
    /cycle/
  );
});

test('snapshot carries the JAR-69 marker and consistent counts', () => {
  const snap = snapshot();
  assert.strictEqual(snap.ok, true);
  assert.strictEqual(snap.marker, 'JAR-69');
  assert.strictEqual(snap.stageCount, snap.stages.length);
  assert.strictEqual(
    snap.taskCount,
    snap.stages.reduce((n, stage) => n + stage.length, 0)
  );
  assert.strictEqual(new Date(snap.timestamp).toISOString(), snap.timestamp);
});

test('scheduler script prints a JAR-69 snapshot and exits 0', () => {
  const script = path.join(__dirname, 'scripts', 'scheduler.js');
  const stdout = execFileSync(process.execPath, [script], { encoding: 'utf8' });
  const parsed = JSON.parse(stdout);
  assert.strictEqual(parsed.ok, true);
  assert.strictEqual(parsed.marker, 'JAR-69');
  assert.ok(Array.isArray(parsed.stages) && parsed.stages.length > 0);
});
