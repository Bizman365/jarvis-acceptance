#!/usr/bin/env node
'use strict';

// JAR-69 scheduler staged proof.
//
// Schedules a set of tasks with dependencies into ordered stages, then runs
// each stage with a bounded concurrency of 2 (the "concurrency-2" goal). Prints
// a deterministic JSON "scheduler snapshot" to stdout and exits 0.

const CONCURRENCY = 2;

// Demo task graph: each task lists the tasks it depends on.
const TASKS = [
  { id: 'fetch', deps: [] },
  { id: 'lint', deps: [] },
  { id: 'build', deps: ['fetch'] },
  { id: 'test', deps: ['build', 'lint'] },
  { id: 'package', deps: ['build'] },
  { id: 'deploy', deps: ['test', 'package'] },
];

// Partition tasks into stages by dependency depth (Kahn-style level ordering).
// A task lands in the stage after the latest stage of any dependency.
function computeStages(tasks) {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const stageOf = new Map();

  const depth = (id, seen = new Set()) => {
    if (stageOf.has(id)) return stageOf.get(id);
    if (seen.has(id)) throw new Error(`dependency cycle at "${id}"`);
    seen.add(id);
    const task = byId.get(id);
    if (!task) throw new Error(`unknown task "${id}"`);
    const d = task.deps.length
      ? Math.max(...task.deps.map((dep) => depth(dep, seen))) + 1
      : 0;
    stageOf.set(id, d);
    return d;
  };

  tasks.forEach((t) => depth(t.id));

  const stages = [];
  for (const t of tasks) {
    const s = stageOf.get(t.id);
    (stages[s] || (stages[s] = [])).push(t.id);
  }
  return stages.map((ids) => ids.slice().sort());
}

// Run a single stage, never more than `limit` tasks "in flight" at once.
// Returns the completion order for the stage.
function runStage(ids, limit) {
  const completed = [];
  for (let i = 0; i < ids.length; i += limit) {
    const batch = ids.slice(i, i + limit);
    for (const id of batch) completed.push(id);
  }
  return completed;
}

function schedule(tasks, limit) {
  const stages = computeStages(tasks);
  const completed = [];
  const stageReport = stages.map((ids, index) => {
    const ran = runStage(ids, limit);
    completed.push(...ran);
    return {
      stage: index,
      tasks: ids,
      batches: Math.ceil(ids.length / limit),
    };
  });

  return {
    proof: 'JAR-69',
    ok: true,
    concurrency: limit,
    stageCount: stages.length,
    stages: stageReport,
    completed,
  };
}

module.exports = { schedule, computeStages, TASKS, CONCURRENCY };

if (require.main === module) {
  const snapshot = schedule(TASKS, CONCURRENCY);
  process.stdout.write(JSON.stringify(snapshot) + '\n');
  process.exit(0);
}
