# jarvis-acceptance

Scratch target repository for the JarvisV2 seeded-goal acceptance gate (JAR-46).
Public by design: `provisionWorktree` fetches with no auth; only the push side is authenticated.

ACCEPTANCE: JAR-46

REVIEWER_IDENTITY: JAR-66

SCHEDULER: JAR-69

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

### Fair staged scheduler

Run the scheduler to drain a flood of queued work into fair stages and print a
scheduler snapshot to stdout:

```
node scripts/scheduler.js
```

Each task is served at most once per stage in round-robin order, so a task with
a large backlog can never starve the others (`fair: true`, `maxPerStage: 1`).
The snapshot reports the stages, per-task service counts, and the fairness
invariant, e.g.:

```
{"marker":"SCHEDULER: JAR-69","fair":true,"stageCount":8,"taskCount":4,"totalUnits":14,"served":{"flood":8,"alpha":3,"beta":2,"gamma":1},"maxPerStage":1,"stages":[["flood","alpha","beta","gamma"], ...]}
```
