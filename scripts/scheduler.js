#!/usr/bin/env node
'use strict';

// JAR-69 scheduler staged proof.
//
// Builds a deterministic, staged execution plan from a set of jobs and prints
// a "scheduler snapshot" as a JSON object to stdout, then exits 0.
//
// A snapshot groups jobs into ordered stages such that every job runs only
// after all of its dependencies have run in an earlier stage.

// Default jobs form a small dependency DAG used as the staged proof fixture.
const DEFAULT_JOBS = [
  { id: 'fetch', deps: [] },
  { id: 'build', deps: ['fetch'] },
  { id: 'test', deps: ['build'] },
  { id: 'lint', deps: ['fetch'] },
  { id: 'deploy', deps: ['test', 'lint'] },
];

// Group jobs into stages via Kahn-style level assignment.
// Returns an array of stages; each stage is a sorted array of job ids that can
// run in parallel once the previous stages are complete.
function stageJobs(jobs) {
  const byId = new Map(jobs.map((j) => [j.id, j]));
  for (const job of jobs) {
    for (const dep of job.deps) {
      if (!byId.has(dep)) {
        throw new Error(`job "${job.id}" depends on unknown job "${dep}"`);
      }
    }
  }

  const stages = [];
  const scheduled = new Set();

  while (scheduled.size < jobs.length) {
    const ready = jobs
      .filter((j) => !scheduled.has(j.id) && j.deps.every((d) => scheduled.has(d)))
      .map((j) => j.id)
      .sort();

    if (ready.length === 0) {
      throw new Error('cycle detected: no runnable jobs remain');
    }

    stages.push(ready);
    for (const id of ready) scheduled.add(id);
  }

  return stages;
}

function snapshot(jobs = DEFAULT_JOBS) {
  const stages = stageJobs(jobs);
  return {
    marker: 'SCHEDULER: JAR-69',
    ok: true,
    jobCount: jobs.length,
    stageCount: stages.length,
    stages,
    timestamp: new Date().toISOString(),
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(snapshot()) + '\n');
  process.exit(0);
}

module.exports = { stageJobs, snapshot, DEFAULT_JOBS };
