# jarvis-acceptance

Scratch target repository for the JarvisV2 seeded-goal acceptance gate (JAR-46).
Public by design: `provisionWorktree` fetches with no auth; only the push side is authenticated.

ACCEPTANCE: JAR-46

REVIEWER_IDENTITY: JAR-66

## Usage

### Health check

Run the health-check script to print a JSON status object and exit 0:

```
node scripts/health-check.js
```

It writes a JSON object to stdout with `ok: true` and an ISO 8601 `timestamp`, e.g.:

```
{"ok":true,"timestamp":"2026-07-07T00:00:00.000Z"}
```

### Scheduler staged proof

Run the scheduler to partition a dependency graph into ordered stages, run each
stage with a bounded concurrency of 2, and print a JSON scheduler snapshot:

```
node scripts/scheduler.js
```

The snapshot carries `proof: "JAR-69"`, the computed `stages` (each with its
tasks and batch count), and the full `completed` task order, e.g.:

```
{"proof":"JAR-69","ok":true,"concurrency":2,"stageCount":4,"stages":[...],"completed":[...]}
```
