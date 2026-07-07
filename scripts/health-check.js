#!/usr/bin/env node
'use strict';

// Prints a health status as a JSON object to stdout and exits 0.
const status = {
  ok: true,
  timestamp: new Date().toISOString(),
};

process.stdout.write(JSON.stringify(status) + '\n');
process.exit(0);
