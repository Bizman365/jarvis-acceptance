#!/usr/bin/env node
'use strict';

// JAR-79 phase 1 staged smoke test.
// Prints a JSON result object to stdout and exits 0.
const result = {
  ok: true,
  name: 'jar79-phase1',
};

process.stdout.write(JSON.stringify(result) + '\n');
process.exit(0);
