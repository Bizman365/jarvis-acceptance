#!/usr/bin/env node
'use strict';

// JAR-69 staged scheduler.
//
// Groups tasks into ordered *stages* by dependency depth: every task lands in
// the earliest stage after all of its dependencies. Tasks sharing a stage have
// no ordering constraint between them, so they may run concurrently. Running
// the file prints a deterministic "scheduler snapshot" JSON object to stdout
// and exits 0.

// Compute execution stages for a set of tasks.
//
// `tasks` is an array of { id, deps? } objects. Returns { marker, stages,
// taskCount }, where `stages` is an array of arrays of task ids in dependency
// order. Throws on unknown dependencies or dependency cycles.
function stageTasks(tasks) {
  const byId = new Map(tasks.map((t) => [t.id, { id: t.id, deps: t.deps || [] }]));

  for (const task of byId.values()) {
    for (const dep of task.deps) {
      if (!byId.has(dep)) {
        throw new Error(`task "${task.id}" depends on unknown task "${dep}"`);
      }
    }
  }

  const stageOf = new Map();

  const depth = (id, seen) => {
    if (stageOf.has(id)) return stageOf.get(id);
    if (seen.has(id)) {
      throw new Error(`dependency cycle detected at task "${id}"`);
    }
    seen.add(id);
    const { deps } = byId.get(id);
    const d = deps.length === 0 ? 0 : 1 + Math.max(...deps.map((dep) => depth(dep, seen)));
    seen.delete(id);
    stageOf.set(id, d);
    return d;
  };

  for (const id of byId.keys()) depth(id, new Set());

  const stages = [];
  // Preserve declaration order within each stage for a stable snapshot.
  for (const task of tasks) {
    const d = stageOf.get(task.id);
    (stages[d] || (stages[d] = [])).push(task.id);
  }

  return {
    marker: 'JAR-69',
    stages,
    taskCount: tasks.length,
  };
}

// A small, representative pipeline used for the proof snapshot.
const SAMPLE_TASKS = [
  { id: 'fetch' },
  { id: 'lint', deps: ['fetch'] },
  { id: 'build', deps: ['fetch'] },
  { id: 'test', deps: ['build'] },
  { id: 'package', deps: ['build', 'lint'] },
  { id: 'deploy', deps: ['test', 'package'] },
];

function snapshot(tasks = SAMPLE_TASKS) {
  const staged = stageTasks(tasks);
  return {
    ok: true,
    marker: staged.marker,
    stageCount: staged.stages.length,
    taskCount: staged.taskCount,
    stages: staged.stages,
    timestamp: new Date().toISOString(),
  };
}

module.exports = { stageTasks, snapshot, SAMPLE_TASKS };

if (require.main === module) {
  process.stdout.write(JSON.stringify(snapshot()) + '\n');
  process.exit(0);
}
