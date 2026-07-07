const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { schedule, computeStages, TASKS, CONCURRENCY } = require('./scripts/scheduler');

test('computeStages orders tasks so no task precedes its dependencies', () => {
  const stages = computeStages(TASKS);
  const stageIndex = new Map();
  stages.forEach((ids, i) => ids.forEach((id) => stageIndex.set(id, i)));

  for (const task of TASKS) {
    for (const dep of task.deps) {
      assert.ok(
        stageIndex.get(dep) < stageIndex.get(task.id),
        `"${dep}" must be scheduled in an earlier stage than "${task.id}"`
      );
    }
  }
});

test('schedule respects concurrency-2 batching and completes every task', () => {
  const snap = schedule(TASKS, CONCURRENCY);

  assert.strictEqual(snap.proof, 'JAR-69');
  assert.strictEqual(snap.ok, true);
  assert.strictEqual(snap.concurrency, 2);

  // Every stage is split into batches of at most `concurrency` tasks.
  for (const stage of snap.stages) {
    assert.ok(stage.tasks.length > 0, 'each stage must contain at least one task');
    assert.strictEqual(stage.batches, Math.ceil(stage.tasks.length / snap.concurrency));
  }

  // All tasks complete exactly once.
  assert.strictEqual(snap.completed.length, TASKS.length);
  assert.strictEqual(new Set(snap.completed).size, TASKS.length);
});

test('scheduler CLI prints a JSON snapshot and exits 0', () => {
  const script = path.join(__dirname, 'scripts', 'scheduler.js');
  const stdout = execFileSync(process.execPath, [script], { encoding: 'utf8' });

  const snap = JSON.parse(stdout);
  assert.strictEqual(snap.proof, 'JAR-69');
  assert.strictEqual(snap.ok, true);
  assert.ok(Array.isArray(snap.stages) && snap.stages.length === snap.stageCount);
  assert.ok(Array.isArray(snap.completed));
});
