const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { stageJobs, snapshot } = require('./scripts/scheduler.js');

test('scheduler CLI prints a valid staged snapshot and exits 0', () => {
  const script = path.join(__dirname, 'scripts', 'scheduler.js');
  const stdout = execFileSync(process.execPath, [script], { encoding: 'utf8' });

  const parsed = JSON.parse(stdout);
  assert.strictEqual(parsed.ok, true, 'ok must be true');
  assert.strictEqual(parsed.marker, 'SCHEDULER: JAR-69', 'marker must be present');
  assert.ok(Array.isArray(parsed.stages), 'stages must be an array');
  assert.strictEqual(parsed.stageCount, parsed.stages.length, 'stageCount must match');

  // ISO 8601 timestamp: round-trips through Date and re-serializes identically.
  assert.strictEqual(
    new Date(parsed.timestamp).toISOString(),
    parsed.timestamp,
    'timestamp must be a valid ISO 8601 string'
  );
});

test('every job runs only after its dependencies in an earlier stage', () => {
  const jobs = [
    { id: 'a', deps: [] },
    { id: 'b', deps: ['a'] },
    { id: 'c', deps: ['a'] },
    { id: 'd', deps: ['b', 'c'] },
  ];
  const stages = stageJobs(jobs);
  const stageOf = new Map();
  stages.forEach((stage, i) => stage.forEach((id) => stageOf.set(id, i)));

  for (const job of jobs) {
    for (const dep of job.deps) {
      assert.ok(
        stageOf.get(dep) < stageOf.get(job.id),
        `dependency "${dep}" must run before "${job.id}"`
      );
    }
  }
});

test('stageJobs detects dependency cycles', () => {
  const jobs = [
    { id: 'x', deps: ['y'] },
    { id: 'y', deps: ['x'] },
  ];
  assert.throws(() => stageJobs(jobs), /cycle detected/);
});

test('stageJobs rejects unknown dependencies', () => {
  const jobs = [{ id: 'x', deps: ['missing'] }];
  assert.throws(() => stageJobs(jobs), /unknown job/);
});

test('default snapshot stages the fixture DAG into ordered levels', () => {
  const snap = snapshot();
  assert.deepStrictEqual(snap.stages, [
    ['fetch'],
    ['build', 'lint'],
    ['test'],
    ['deploy'],
  ]);
  assert.strictEqual(snap.jobCount, 5);
});
