const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { schedule } = require('./scripts/scheduler');

test('scheduler serves each task at most once per stage (fairness)', () => {
  const { stages, snapshot } = schedule([
    { id: 'flood', units: 8 },
    { id: 'alpha', units: 3 },
    { id: 'beta', units: 2 },
  ]);

  for (const stage of stages) {
    assert.strictEqual(
      new Set(stage).size,
      stage.length,
      'no task may appear twice in a single stage'
    );
  }
  assert.strictEqual(snapshot.maxPerStage, 1, 'maxPerStage must be 1');
  assert.strictEqual(snapshot.fair, true, 'snapshot must report fair:true');
});

test('a flooding task never starves the small tasks', () => {
  const { stages } = schedule([
    { id: 'flood', units: 10 },
    { id: 'small', units: 2 },
  ]);

  // The small task's two units must be served in the first two stages,
  // not deferred until the flood drains.
  assert.ok(stages[0].includes('small'), 'small served in stage 0');
  assert.ok(stages[1].includes('small'), 'small served in stage 1');
});

test('every unit of work is served exactly once', () => {
  const tasks = [
    { id: 'a', units: 4 },
    { id: 'b', units: 1 },
    { id: 'c', units: 3 },
  ];
  const { snapshot } = schedule(tasks);

  for (const t of tasks) {
    assert.strictEqual(snapshot.served[t.id], t.units, `${t.id} fully served`);
  }
  const totalServed = Object.values(snapshot.served).reduce((s, c) => s + c, 0);
  assert.strictEqual(totalServed, 8, 'all 8 units served');
  assert.strictEqual(snapshot.stageCount, 4, 'stages bounded by the max backlog');
});

test('stage count equals the largest per-task backlog', () => {
  const { snapshot } = schedule([
    { id: 'x', units: 5 },
    { id: 'y', units: 2 },
  ]);
  assert.strictEqual(snapshot.stageCount, 5);
});

test('empty and zero-unit inputs produce no stages', () => {
  assert.strictEqual(schedule([]).stages.length, 0);
  assert.strictEqual(schedule([{ id: 'idle', units: 0 }]).stages.length, 0);
});

test('rejects malformed tasks', () => {
  assert.throws(() => schedule('nope'), TypeError);
  assert.throws(() => schedule([{ units: 1 }]), TypeError);
  assert.throws(() => schedule([{ id: 'neg', units: -1 }]), RangeError);
});

test('CLI emits a fair scheduler snapshot with the JAR-69 marker', () => {
  const script = path.join(__dirname, 'scripts', 'scheduler.js');
  const stdout = execFileSync(process.execPath, [script], { encoding: 'utf8' });
  const parsed = JSON.parse(stdout);

  assert.strictEqual(parsed.marker, 'SCHEDULER: JAR-69');
  assert.strictEqual(parsed.fair, true);
  assert.strictEqual(parsed.maxPerStage, 1);
  assert.ok(Array.isArray(parsed.stages), 'snapshot includes the stages');
  assert.ok(parsed.stages.length > 0, 'snapshot has at least one stage');
});
