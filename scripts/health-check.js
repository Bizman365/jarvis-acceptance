#!/usr/bin/env node
'use strict';

// Health check: prints a JSON object with ok:true and an ISO timestamp,
// then exits 0.
function healthCheck() {
  return { ok: true, timestamp: new Date().toISOString() };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(healthCheck()) + '\n');
  process.exit(0);
}

module.exports = { healthCheck };
