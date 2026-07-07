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

### Scheduler snapshot

Run the staged scheduler to print a "scheduler snapshot" JSON object and exit 0:

```
node scripts/scheduler.js
```

It groups tasks into ordered *stages* by dependency depth — tasks sharing a
stage have no ordering constraint and may run concurrently. The snapshot lists
the stages along with the `JAR-69` marker and an ISO 8601 `timestamp`, e.g.:

```
{"ok":true,"marker":"JAR-69","stageCount":4,"taskCount":6,"stages":[["fetch"],["lint","build"],["test","package"],["deploy"]],"timestamp":"2026-07-07T00:00:00.000Z"}
```
