#!/usr/bin/env node
'use strict';

// JAR-69: fair staged scheduler.
//
// Drains a "flood" of queued work fairly. Each task carries a number of
// pending work units; the scheduler serves at most one unit per task per
// stage in round-robin order, so a task with a huge backlog can never
// starve the others. The result is a deterministic set of stages plus a
// snapshot that proves the fairness property held for the whole run.

/**
 * Schedule tasks into fair stages.
 *
 * @param {Array<{id: string, units: number}>} tasks
 * @returns {{stages: string[][], snapshot: object}}
 */
function schedule(tasks) {
  if (!Array.isArray(tasks)) {
    throw new TypeError('tasks must be an array');
  }

  // Remaining work per task, preserving the caller's ordering for the
  // round-robin pass. Ignore tasks with no pending work.
  const remaining = tasks.map((t) => {
    if (!t || typeof t.id !== 'string') {
      throw new TypeError('each task needs a string id');
    }
    const units = Number.isInteger(t.units) ? t.units : 0;
    if (units < 0) {
      throw new RangeError(`task ${t.id} has negative units`);
    }
    return { id: t.id, units };
  });

  const stages = [];
  // Keep draining until every task is empty. One stage = one fair pass.
  while (remaining.some((t) => t.units > 0)) {
    const stage = [];
    for (const t of remaining) {
      if (t.units > 0) {
        stage.push(t.id);
        t.units -= 1;
      }
    }
    stages.push(stage);
  }

  const served = {};
  for (const stage of stages) {
    for (const id of stage) {
      served[id] = (served[id] || 0) + 1;
    }
  }

  // Fairness invariant: within any single stage no task is served more than
  // once, so the gap between two consecutive services of any task is exactly
  // one stage. maxPerStage === 1 proves no task floods a stage.
  const maxPerStage = stages.reduce((max, stage) => {
    const counts = {};
    for (const id of stage) counts[id] = (counts[id] || 0) + 1;
    const localMax = Object.values(counts).reduce((m, c) => Math.max(m, c), 0);
    return Math.max(max, localMax);
  }, 0);

  const snapshot = {
    marker: 'SCHEDULER: JAR-69',
    fair: maxPerStage <= 1,
    stageCount: stages.length,
    taskCount: remaining.length,
    totalUnits: Object.values(served).reduce((sum, c) => sum + c, 0),
    served,
    maxPerStage,
  };

  return { stages, snapshot };
}

module.exports = { schedule };

// When run directly, emit a scheduler snapshot for a representative flood:
// one task with a large backlog alongside several small ones. A fair
// scheduler must interleave them rather than draining the big one first.
if (require.main === module) {
  const flood = [
    { id: 'flood', units: 8 },
    { id: 'alpha', units: 3 },
    { id: 'beta', units: 2 },
    { id: 'gamma', units: 1 },
  ];
  const { stages, snapshot } = schedule(flood);
  process.stdout.write(JSON.stringify({ ...snapshot, stages }) + '\n');
  process.exit(0);
}
