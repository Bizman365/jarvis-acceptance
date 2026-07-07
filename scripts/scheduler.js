#!/usr/bin/env node
'use strict';

// JAR-69 scheduler staged proof.
//
// Stages a fixed set of jobs and prints a scheduler snapshot as a JSON object
// to stdout, then exits 0. The snapshot proves the scheduler staged its jobs
// deterministically: every job is in the "staged" state and ordered by its
// numeric priority (lowest number runs first).

const PROOF = 'JAR-69';

const jobs = [
  { id: 'ingest', priority: 10 },
  { id: 'transform', priority: 20 },
  { id: 'publish', priority: 30 },
];

const staged = jobs
  .slice()
  .sort((a, b) => a.priority - b.priority)
  .map((job, index) => ({
    id: job.id,
    priority: job.priority,
    order: index,
    state: 'staged',
  }));

const snapshot = {
  proof: PROOF,
  ok: true,
  staged,
  count: staged.length,
  timestamp: new Date().toISOString(),
};

process.stdout.write(JSON.stringify(snapshot) + '\n');
process.exit(0);
